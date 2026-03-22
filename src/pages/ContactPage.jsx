
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Mail, Phone, MapPin, MessageCircle, Facebook, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPageMeta } from '@/lib/meta';
import { CONTACT_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { sanitizeInput, validateForm, contactSchema } from '@/lib/validators';

const ContactPage = () => {
  const meta = getPageMeta('contact');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des champs
    const { isValid, errors } = validateForm(formData, contactSchema);
    if (!isValid) {
      setFieldErrors(errors);
      toast({
        title: "Formulaire invalide",
        description: "Veuillez corriger les champs indiqués avant d'envoyer.",
        variant: "destructive",
      });
      return;
    }
    setFieldErrors({});

    // Sanitisation avant stockage
    const safeData = {
      name:    sanitizeInput(formData.name),
      email:   sanitizeInput(formData.email),
      subject: sanitizeInput(formData.subject),
      message: sanitizeInput(formData.message),
    };

    // Save to localStorage
    const messages = JSON.parse(localStorage.getItem('philiastore_messages') || '[]');
    messages.push({
      ...safeData,
      date: new Date().toISOString(),
    });
    localStorage.setItem('philiastore_messages', JSON.stringify(messages));

    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
    });
  };
  
  const contactMethods = [
    {
      icon: Phone,
      title: 'Téléphone',
      value: CONTACT_INFO.phone,
      link: `tel:${CONTACT_INFO.phone}`,
      color: 'bg-blue-500',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: CONTACT_INFO.phone,
      link: CONTACT_INFO.whatsapp,
      color: 'bg-green-500',
    },
    {
      icon: Mail,
      title: 'Email',
      value: CONTACT_INFO.email,
      link: `mailto:${CONTACT_INFO.email}`,
      color: 'bg-red-500',
    },
    {
      icon: MapPin,
      title: 'Adresse',
      value: CONTACT_INFO.address,
      link: null,
      color: 'bg-[#C9A84C]',
    },
  ];
  
  const socialLinks = [
    { icon: Facebook, url: CONTACT_INFO.facebook, color: 'hover:text-blue-600' },
    { icon: Instagram, url: CONTACT_INFO.instagram, color: 'hover:text-pink-600' },
    { icon: Twitter, url: CONTACT_INFO.twitter, color: 'hover:text-blue-400' },
  ];
  
  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[#C9A84C] to-[#8B7635] text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Contactez-nous
              </h1>
              <p className="text-xl opacity-90">
                Notre équipe est à votre écoute pour répondre à toutes vos questions
              </p>
            </motion.div>
          </div>
        </section>
        
        {/* Contact Methods */}
        <section className="py-12 -mt-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center"
                  >
                    <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{method.title}</h3>
                    {method.link ? (
                      <a
                        href={method.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C9A84C] hover:underline"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <p className="text-gray-600">{method.value}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Envoyez-nous un message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nom complet *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg outline-none focus:border-[#C9A84C] text-gray-900 ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg outline-none focus:border-[#C9A84C] text-gray-900 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Sujet *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg outline-none focus:border-[#C9A84C] text-gray-900 ${fieldErrors.subject ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.subject && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="5"
                      className={`w-full px-4 py-3 border rounded-lg outline-none focus:border-[#C9A84C] resize-none text-gray-900 ${fieldErrors.message ? 'border-red-500' : 'border-gray-300'}`}
                    ></textarea>
                    {fieldErrors.message && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-[#C9A84C] hover:bg-[#8B7635] py-6 text-lg">
                    Envoyer le message
                  </Button>
                </form>
              </motion.div>
              
              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Hours */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">Horaires d'ouverture</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lundi - Vendredi</span>
                      <span className="font-semibold">8h00 - 20h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Samedi</span>
                      <span className="font-semibold">9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dimanche</span>
                      <span className="font-semibold">10h00 - 16h00</span>
                    </div>
                  </div>
                </div>
                
                {/* WhatsApp CTA */}
                <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-2xl shadow-lg p-8">
                  <MessageCircle className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Commandez via WhatsApp</h3>
                  <p className="mb-6 opacity-90">
                    Besoin d'aide immédiate ? Contactez-nous directement sur WhatsApp pour une réponse rapide !
                  </p>
                  <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-white text-[#25D366] hover:bg-gray-100">
                      Ouvrir WhatsApp
                    </Button>
                  </a>
                </div>
                
                {/* Social Media */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold mb-6">Suivez-nous</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 ${social.color} transition-colors`}
                        >
                          <Icon className="w-6 h-6" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;
