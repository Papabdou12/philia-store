
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPageMeta } from '@/lib/meta';
import { useCart } from '@/hooks/useCart';
import { SENEGAL_REGIONS, PAYMENT_METHODS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateWhatsAppLink, generateTrackingLink } from '@/lib/whatsapp';
import { createOrder } from '@/services/orderService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { sanitizeInput, validateForm, checkoutSchema } from '@/lib/validators';

const CheckoutPage = () => {
  const meta = getPageMeta('checkout');
  const { cart, getTotal, getCartTotal, getDiscount, clearCart, coupon } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Delivery
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: 'Dakar',
    deliveryMethod: 'dakar-express',
    
    // Step 2: Payment
    paymentMethod: 'cash',
  });
  
  const [orderNumber, setOrderNumber] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Effacer l'erreur du champ modifié
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateStep1 = () => {
    const { isValid, errors } = validateForm(formData, checkoutSchema);
    if (!isValid) {
      setFieldErrors(errors);
      toast({
        title: "Informations incomplètes",
        description: "Veuillez corriger les champs indiqués avant de continuer.",
        variant: "destructive",
      });
      return false;
    }
    setFieldErrors({});
    return true;
  };
  
  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };
  
  const handlePrevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmitOrder = async () => {
    // Calculate totals
    const subtotal = getCartTotal();
    const discount = getDiscount();
    const currentDeliveryFee = formData.region === 'Dakar' ? 2500 : 5000;
    const orderTotal = subtotal - discount + currentDeliveryFee;

    // Sanitisation anti-XSS de toutes les données texte avant envoi
    const safeName    = sanitizeInput(formData.name);
    const safePhone   = sanitizeInput(formData.phone);
    const safeEmail   = sanitizeInput(formData.email);
    const safeAddress = sanitizeInput(formData.address);
    const safeCity    = sanitizeInput(formData.city);
    const safeNotes   = sanitizeInput(formData.notes || '');

    const nameParts = safeName.split(' ');
    const firstName = nameParts[0] || safeName;
    const lastName = nameParts.slice(1).join(' ') || '';

    const orderPayload = {
      customer: {
        firstName,
        lastName,
        name: safeName,
        phone: safePhone,
        email: safeEmail,
        address: `${safeAddress}, ${safeCity}`,
        notes: safeNotes,
      },
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || null,
      })),
      delivery: {
        region: formData.region,
        zone: formData.deliveryMethod === 'dakar-express' ? 'dakar-express' : 'regions',
        cost: currentDeliveryFee,
      },
      payment: { method: formData.paymentMethod },
      coupon: coupon || null,
      subtotal,
      discountAmount: discount,
      total: orderTotal,
    };

    let orderNum;

    if (isSupabaseConfigured()) {
      try {
        const result = await createOrder(orderPayload);
        orderNum = result.orderNumber;
      } catch (err) {
        console.error('Supabase createOrder failed, using local fallback:', err);
        toast({
          title: "Enregistrement partiel",
          description: "La commande sera transmise par WhatsApp.",
          variant: "destructive",
        });
        orderNum = `PHI${Date.now().toString().slice(-8)}`;
      }
    } else {
      // Fallback local
      orderNum = `PHI${Date.now().toString().slice(-8)}`;
    }

    setOrderNumber(orderNum);

    // Build WhatsApp-compatible order object
    const whatsappOrder = {
      orderNumber: orderNum,
      date: new Date().toISOString(),
      customer: {
        firstName,
        lastName,
        phone: safePhone,
        email: safeEmail,
        address: `${safeAddress}, ${safeCity}`,
        notes: safeNotes,
      },
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || null,
      })),
      delivery: {
        zone: formData.deliveryMethod === 'dakar-express' ? 'Dakar Express' : 'Provinces',
        region: formData.region,
        cost: currentDeliveryFee,
      },
      subtotal,
      discountAmount: discount,
      coupon: coupon || null,
      total: orderTotal,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
    };

    // Store for WhatsApp button
    setCompletedOrder(whatsappOrder);

    // Save to localStorage as fallback record
    const existingOrders = JSON.parse(localStorage.getItem('philiastore_orders') || '[]');
    existingOrders.push({ ...whatsappOrder, orderNumber: orderNum });
    localStorage.setItem('philiastore_orders', JSON.stringify(existingOrders));

    // Clear cart
    clearCart();

    // Move to confirmation step
    setStep(3);
  };
  
  const deliveryFee = formData.region === 'Dakar' ? 2500 : 5000;
  const total = getTotal() + deliveryFee;
  
  if (cart.length === 0 && step !== 3) {
    navigate('/panier');
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 border-b border-bronze/20 pb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-2">
              Finalisation
            </h1>
            <p className="text-bronze tracking-widest uppercase text-xs">Commande sécurisée</p>
          </div>
          
          {/* Step Indicator */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center space-x-2 md:space-x-4">
              {[
                { num: 1, label: 'Expédition' },
                { num: 2, label: 'Paiement' },
                { num: 3, label: 'Confirmation' },
              ].map((s, index) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm border transition-luxury ${
                        step >= s.num
                          ? 'bg-gold border-gold text-black shadow-glow-gold'
                          : 'bg-transparent border-bronze/50 text-gray-500'
                      }`}
                    >
                      {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                    </div>
                    <span className={`mt-3 text-[10px] uppercase tracking-widest absolute translate-y-12 ${step >= s.num ? 'text-gold' : 'text-gray-500'}`}>{s.label}</span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`w-12 md:w-24 h-px ${
                        step > s.num ? 'bg-gold' : 'bg-bronze/30'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="mt-16">
            <AnimatePresence mode="wait">
              {/* Step 1: Delivery Information */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#0A0A0A] border border-bronze/30 rounded-sm p-8 md:p-12"
                >
                  <h2 className="text-2xl font-serif text-gold mb-8 border-b border-bronze/20 pb-4 inline-block">Coordonnées d'expédition</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Nom complet *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border rounded-sm outline-none focus:border-gold text-white transition-luxury ${fieldErrors.name ? 'border-red-500' : 'border-bronze/40'}`}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Téléphone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border rounded-sm outline-none focus:border-gold text-white transition-luxury ${fieldErrors.phone ? 'border-red-500' : 'border-bronze/40'}`}
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border rounded-sm outline-none focus:border-gold text-white transition-luxury ${fieldErrors.email ? 'border-red-500' : 'border-bronze/40'}`}
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Adresse détaillée *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border rounded-sm outline-none focus:border-gold text-white transition-luxury ${fieldErrors.address ? 'border-red-500' : 'border-bronze/40'}`}
                      />
                      {fieldErrors.address && (
                        <p className="mt-1 text-xs text-red-400">{fieldErrors.address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Ville *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-black border rounded-sm outline-none focus:border-gold text-white transition-luxury ${fieldErrors.city ? 'border-red-500' : 'border-bronze/40'}`}
                      />
                      {fieldErrors.city && (
                        <p className="mt-1 text-xs text-red-400">{fieldErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Région *</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black border border-bronze/40 rounded-sm outline-none focus:border-gold text-white transition-luxury appearance-none"
                      >
                        {SENEGAL_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-bronze/20">
                    <h3 className="text-lg font-serif text-gold mb-6">Mode de livraison</h3>
                    <div className="space-y-4">
                      <label className={`flex items-center p-5 border rounded-sm cursor-pointer transition-luxury ${
                        formData.deliveryMethod === 'dakar-express' ? 'border-gold bg-gold/5' : 'border-bronze/30 hover:border-bronze bg-black'
                      }`}>
                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center mr-4 ${
                          formData.deliveryMethod === 'dakar-express' ? 'border-gold' : 'border-gray-500'
                        }`}>
                          {formData.deliveryMethod === 'dakar-express' && <div className="w-2 h-2 bg-gold rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="dakar-express"
                          checked={formData.deliveryMethod === 'dakar-express'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className="flex-1">
                          <p className="font-serif text-lg text-white">Dakar Express</p>
                          <p className="text-xs text-gray-400 mt-1">Livraison sous 24h par coursier</p>
                        </div>
                        <span className="text-gold font-mono">2,500 FCFA</span>
                      </label>
                      
                      <label className={`flex items-center p-5 border rounded-sm cursor-pointer transition-luxury ${
                        formData.deliveryMethod === 'regions' ? 'border-gold bg-gold/5' : 'border-bronze/30 hover:border-bronze bg-black'
                      }`}>
                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center mr-4 ${
                          formData.deliveryMethod === 'regions' ? 'border-gold' : 'border-gray-500'
                        }`}>
                          {formData.deliveryMethod === 'regions' && <div className="w-2 h-2 bg-gold rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="regions"
                          checked={formData.deliveryMethod === 'regions'}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div className="flex-1">
                          <p className="font-serif text-lg text-white">Provinces</p>
                          <p className="text-xs text-gray-400 mt-1">Expédition soignée 48-72h</p>
                        </div>
                        <span className="text-gold font-mono">5,000 FCFA</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-12">
                    <Button onClick={handleNextStep} className="bg-gold hover:bg-[#B8962E] text-black px-10 py-6 uppercase tracking-widest text-xs font-bold rounded-sm shadow-glow-gold transition-luxury">
                      Poursuivre
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Step 2: Payment Method */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#0A0A0A] border border-bronze/30 rounded-sm p-8 md:p-12"
                >
                  <h2 className="text-2xl font-serif text-gold mb-8 border-b border-bronze/20 pb-4 inline-block">Règlement</h2>
                  
                  <div className="space-y-4 mb-12">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-5 border rounded-sm transition-luxury ${
                          !method.available
                            ? 'border-bronze/10 bg-black/50 opacity-50 cursor-not-allowed'
                            : formData.paymentMethod === method.id
                              ? 'border-gold bg-gold/5 cursor-pointer'
                              : 'border-bronze/30 hover:border-bronze bg-black cursor-pointer'
                        }`}
                      >
                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center mr-6 ${
                          formData.paymentMethod === method.id && method.available ? 'border-gold' : 'border-gray-600'
                        }`}>
                          {formData.paymentMethod === method.id && method.available && <div className="w-2 h-2 bg-gold rounded-full" />}
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={method.available ? handleInputChange : undefined}
                          disabled={!method.available}
                          className="hidden"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className={`text-3xl mr-5 ${method.available ? 'opacity-80' : 'grayscale opacity-40'}`}>{method.icon}</span>
                            <div>
                              <p className={`font-serif text-lg tracking-wide ${method.available ? 'text-white' : 'text-gray-600'}`}>{method.name}</p>
                              <p className={`text-xs font-light mt-1 ${method.available ? 'text-gray-500' : 'text-gray-700'}`}>{method.description}</p>
                            </div>
                          </div>
                          {!method.available && (
                            <span className="text-[10px] uppercase tracking-widest text-gray-600 border border-gray-700 px-2 py-0.5 rounded-sm">
                              Bientôt
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-black border border-bronze/20 rounded-sm p-8 mb-10">
                    <h3 className="font-serif text-lg text-white mb-6 uppercase tracking-wider text-center">Récapitulatif</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Articles</span>
                        <span className="font-mono">{getTotal().toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Frais d'expédition</span>
                        <span className="font-mono">{deliveryFee.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                    <div className="w-full h-px bg-bronze/30 mb-6"></div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs uppercase tracking-widest text-gray-300">Montant Final</span>
                      <span className="text-2xl font-serif text-gold">{total.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button onClick={handlePrevStep} className="text-bronze hover:text-gold text-xs uppercase tracking-widest transition-luxury border-b border-transparent hover:border-gold pb-1">
                      Retour
                    </button>
                    <Button onClick={handleSubmitOrder} className="bg-gold hover:bg-[#B8962E] text-black px-10 py-6 uppercase tracking-widest text-xs font-bold rounded-sm shadow-glow-gold transition-luxury">
                      Confirmer l'achat
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0A0A0A] border border-bronze/30 rounded-sm p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gold/5 pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 border border-gold rounded-full flex items-center justify-center mx-auto mb-8 bg-black shadow-glow-gold">
                      <CheckCircle className="w-10 h-10 text-gold" />
                    </div>
                    
                    <h2 className="text-4xl font-serif text-gold mb-4">
                      Félicitations
                    </h2>
                    
                    <p className="text-gray-300 mb-10 font-light max-w-lg mx-auto leading-relaxed">
                      Votre commande a été traitée avec succès. Notre équipe prépare actuellement vos articles avec le plus grand soin.
                    </p>
                    
                    <div className="bg-black border border-bronze/20 rounded-sm p-8 mb-10 text-left max-w-md mx-auto">
                      {/* N° commande */}
                      <div className="flex justify-between mb-4 border-b border-bronze/10 pb-4">
                        <span className="text-xs uppercase tracking-widest text-gray-500">N° de commande</span>
                        <span className="font-mono text-white">{orderNumber}</span>
                      </div>

                      {/* Sous-total */}
                      {completedOrder?.subtotal > 0 && (
                        <div className="flex justify-between mb-3">
                          <span className="text-xs uppercase tracking-widest text-gray-500">Sous-total</span>
                          <span className="text-white text-sm">{completedOrder.subtotal.toLocaleString()} FCFA</span>
                        </div>
                      )}

                      {/* Réduction coupon */}
                      {completedOrder?.discountAmount > 0 && (
                        <div className="flex justify-between mb-3">
                          <span className="text-xs uppercase tracking-widest text-gray-500">
                            Réduction {completedOrder.coupon ? `(${completedOrder.coupon})` : ''}
                          </span>
                          <span className="text-green-400 text-sm">−{completedOrder.discountAmount.toLocaleString()} FCFA</span>
                        </div>
                      )}

                      {/* Livraison */}
                      <div className="flex justify-between mb-4 border-b border-bronze/10 pb-4">
                        <span className="text-xs uppercase tracking-widest text-gray-500">
                          Livraison {completedOrder?.delivery?.zone ? `(${completedOrder.delivery.zone})` : ''}
                        </span>
                        <span className="text-white text-sm">
                          {completedOrder?.delivery?.cost
                            ? `${completedOrder.delivery.cost.toLocaleString()} FCFA`
                            : '—'}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between mb-4 border-b border-bronze/10 pb-4">
                        <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
                        <span className="font-serif text-gold text-xl">
                          {completedOrder?.total?.toLocaleString() ?? '—'} FCFA
                        </span>
                      </div>

                      {/* Mode de paiement */}
                      <div className="flex justify-between">
                        <span className="text-xs uppercase tracking-widest text-gray-500">Mode de paiement</span>
                        <span className="text-white text-sm">
                          {PAYMENT_METHODS.find(m => m.id === completedOrder?.paymentMethod)?.name ?? '—'}
                        </span>
                      </div>
                    </div>
                    
                    {/* WhatsApp Order Button */}
                    {completedOrder && (
                      <a
                        href={generateWhatsAppLink(completedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white px-10 py-6 uppercase tracking-widest text-xs font-bold rounded-sm transition-luxury mb-4 w-full max-w-md cursor-pointer"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Envoyer via WhatsApp
                      </a>
                    )}

                    <p className="text-xs text-gray-500 mb-8 max-w-md">
                      Cliquez sur le bouton ci-dessus pour nous envoyer votre commande directement sur WhatsApp et recevoir une confirmation rapide.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={generateTrackingLink(orderNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-transparent border border-bronze/50 text-gray-300 hover:border-gold hover:text-gold px-8 py-4 uppercase tracking-widest text-[10px] rounded-sm transition-luxury cursor-pointer"
                      >
                        Suivre ma commande
                      </a>
                      <Button onClick={() => navigate('/')} className="bg-transparent border border-bronze text-white hover:bg-bronze hover:text-black px-8 py-4 uppercase tracking-widest text-[10px] rounded-sm transition-luxury">
                        Retour à l'accueil
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
