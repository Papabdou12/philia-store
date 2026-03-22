import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Package,
  Loader2,
  MessageCircle,
  Scale,
} from 'lucide-react';
import StatusBadge, { getStatusOptions } from '@/components/admin/StatusBadge';
import { getOrderById, updateOrderStatus } from '@/services/orderService';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statusOptions = getStatusOptions();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const notifyByWhatsApp = () => {
    const statusOptions = getStatusOptions();
    const statusLabel =
      statusOptions.find((opt) => opt.value === order.status)?.label || order.status;
    const phone = order.customer_phone.replace(/\s/g, '');
    const msg = encodeURIComponent(
      `Bonjour ${order.customer_name} 👋\n\nVotre commande Philia'Store N°${order.order_number} est ${statusLabel}.\n\nMerci pour votre confiance !\n\n📞 Service client : +221 78 396 89 70`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-white/60">Commande non trouvée</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-bronze/30 rounded-lg text-gray-900 dark:text-white hover:border-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif text-gray-900 dark:text-white">
              Commande {order.order_number}
            </h1>
            <p className="text-gray-500 dark:text-white/60">
              Passée le {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} size="lg" />
          <button
            onClick={notifyByWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Notifier par WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gold" />
              Articles commandés
            </h2>

            <div className="space-y-4">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-black rounded-lg border border-gray-200 dark:border-bronze/10"
                >
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">{item.product_name}</p>
                    <p className="text-gray-500 dark:text-white/40 text-sm">
                      SKU: {item.product_sku}
                      {item.selected_color && ` • Couleur: ${item.selected_color}`}
                      {item.selected_size && ` • Taille: ${item.selected_size}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white">x{item.quantity}</p>
                    <p className="text-gold font-medium">
                      {(item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-bronze/20 space-y-2">
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Sous-total</span>
                <span>{parseFloat(order.subtotal).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-white/60">
                <span>Livraison ({order.delivery_zone})</span>
                <span>{parseFloat(order.delivery_cost).toLocaleString('fr-FR')} FCFA</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Réduction ({order.coupon_code})</span>
                  <span>-{parseFloat(order.discount_amount).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 dark:text-white text-lg font-bold pt-2">
                <span>Total</span>
                <span className="text-gold">
                  {parseFloat(order.total).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {/* Total weight */}
            {(() => {
              const totalWeight = order.items?.reduce((acc, item) => {
                return acc + (item.product?.weight || 0) * item.quantity;
              }, 0);
              return totalWeight > 0 ? (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-bronze/10 flex items-center gap-2 text-gray-500 dark:text-white/50 text-sm">
                  <Scale className="w-4 h-4 text-gold" />
                  <span className="text-gray-500 dark:text-white/50">Poids total : {totalWeight.toFixed(2)} kg</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Notes</h2>
              <p className="text-gray-500 dark:text-white/60">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status update */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Mettre à jour le statut
            </h2>

            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-bronze/30 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:border-gold outline-none disabled:opacity-50"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {updating && (
              <div className="flex items-center gap-2 mt-2 text-gold text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mise à jour...</span>
              </div>
            )}
          </div>

          {/* Customer info */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gold" />
              Client
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-gray-900 dark:text-white font-medium">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-white/60">
                <Mail className="w-4 h-4" />
                <span>{order.customer_email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500 dark:text-white/60">
                <Phone className="w-4 h-4" />
                <span>{order.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              Livraison
            </h2>

            <div className="space-y-2 text-gray-500 dark:text-white/60">
              <p>{order.delivery_address}</p>
              <p>{order.delivery_region}</p>
              <p className="text-gold font-medium">
                {order.delivery_zone} • {parseFloat(order.delivery_cost).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-bronze/20 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              Paiement
            </h2>

            <p className="text-gray-900 dark:text-white capitalize">{order.payment_method}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
