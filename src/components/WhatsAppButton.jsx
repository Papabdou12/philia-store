
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTACT_INFO } from '@/lib/constants';

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleClick = () => {
    const message = encodeURIComponent("Bonjour Philia'Store 👋 J'aimerais avoir plus d'informations sur vos produits.");
    window.open(`${CONTACT_INFO.whatsapp}?text=${message}`, '_blank');
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white px-4 py-2 rounded-lg whitespace-nowrap shadow-lg"
          >
            Commandez via WhatsApp !
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className="bg-[#25D366] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(37, 211, 102, 0.7)',
            '0 0 0 20px rgba(37, 211, 102, 0)',
          ],
        }}
        transition={{
          boxShadow: {
            repeat: Infinity,
            duration: 2,
          },
        }}
      >
        <MessageCircle className="w-8 h-8" />
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
