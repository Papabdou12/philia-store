/**
 * Service WhatsApp pour Philia'Store
 * Génère des liens WhatsApp avec messages pré-remplis
 */

// Numéro WhatsApp de la boutique (format international sans +) — via .env
export const WHATSAPP_NUMBER = import.meta.env.VITE_STORE_WHATSAPP || '';

/**
 * Génère un message de commande formaté pour WhatsApp
 */
export const formatOrderMessage = (order) => {
  const { orderNumber, customer, items, delivery, subtotal, discountAmount, coupon, total, paymentMethod } = order;

  let message = `🛒 *NOUVELLE COMMANDE - PHILIA'STORE*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📋 *N° Commande:* ${orderNumber}\n`;
  message += `📅 *Date:* ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n\n`;

  message += `👤 *CLIENT*\n`;
  message += `Nom: ${customer.firstName} ${customer.lastName}\n`;
  message += `Tél: ${customer.phone}\n`;
  message += `Email: ${customer.email}\n`;
  if (customer.address) {
    message += `Adresse: ${customer.address}\n`;
  }
  message += `\n`;

  message += `📦 *ARTICLES COMMANDÉS*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    if (item.variant?.color || item.variant?.size) {
      const variants = [];
      if (item.variant.color) variants.push(`Couleur: ${item.variant.color}`);
      if (item.variant.size) variants.push(`Taille: ${item.variant.size}`);
      message += `   _${variants.join(' | ')}_\n`;
    }
    message += `   Qté: ${item.quantity} × ${item.price.toLocaleString('fr-FR')} FCFA\n`;
    message += `   = *${(item.quantity * item.price).toLocaleString('fr-FR')} FCFA*\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📍 *LIVRAISON*\n`;
  message += `Zone: ${delivery.zone}\n`;
  message += `Région: ${delivery.region}\n`;
  message += `Frais: ${delivery.cost.toLocaleString('fr-FR')} FCFA\n\n`;

  message += `💰 *RÉCAPITULATIF*\n`;
  message += `Sous-total: ${subtotal.toLocaleString('fr-FR')} FCFA\n`;
  if (discountAmount > 0) {
    message += `Réduction (${coupon?.code}): -${discountAmount.toLocaleString('fr-FR')} FCFA\n`;
  }
  message += `Livraison: ${delivery.cost.toLocaleString('fr-FR')} FCFA\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*TOTAL: ${total.toLocaleString('fr-FR')} FCFA*\n\n`;

  message += `💳 *Paiement:* ${getPaymentMethodLabel(paymentMethod)}\n\n`;

  if (customer.notes) {
    message += `📝 *Notes:* ${customer.notes}\n\n`;
  }

  message += `✅ Merci de confirmer la réception de cette commande.`;

  return message;
};

/**
 * Génère le lien WhatsApp avec le message pré-rempli
 */
export const generateWhatsAppLink = (order) => {
  const message = formatOrderMessage(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

/**
 * Génère un message simple de contact
 */
export const generateContactLink = (message = '') => {
  const defaultMessage = message || 'Bonjour Philia\'Store, j\'ai une question concernant...';
  const encodedMessage = encodeURIComponent(defaultMessage);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

/**
 * Génère un message de suivi de commande
 */
export const generateTrackingLink = (orderNumber) => {
  const message = `Bonjour Philia'Store,\n\nJe souhaite suivre ma commande:\n📋 N° ${orderNumber}\n\nMerci!`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
};

/**
 * Label des méthodes de paiement
 */
const getPaymentMethodLabel = (method) => {
  const labels = {
    wave: '📱 Wave',
    orange_money: '📱 Orange Money',
    free_money: '📱 Free Money',
    cash: '💵 Paiement à la livraison',
  };
  return labels[method] || method;
};

export default {
  WHATSAPP_NUMBER,
  formatOrderMessage,
  generateWhatsAppLink,
  generateContactLink,
  generateTrackingLink,
};
