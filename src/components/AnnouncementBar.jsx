
import React from 'react';

const AnnouncementBar = () => {
  const announcements = [
    'Livraison offerte à Dakar sous 24h',
    'Paiement sécurisé à la livraison ou par mobile',
    'Bénéficiez de 15% avec le code BIENVENUE',
  ];
  
  return (
    <div className="bg-[#8B7355] bg-opacity-5 text-[#333333] py-1.5 border-b border-bronze-subtle">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs tracking-wider uppercase font-light">
          {announcements[0]} | {announcements[2]}
        </p>
      </div>
    </div>
  );
};

export default AnnouncementBar;
