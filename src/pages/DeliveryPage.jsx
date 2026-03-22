import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '@/lib/constants';
import { getDeliveryZones } from '@/services/settingsService';

const DeliveryPage = () => {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    getDeliveryZones().then(setZones).catch(() => {});
  }, []);

  return (
    <div className="bg-black text-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Informations</p>
          <h1 className="text-3xl md:text-4xl font-serif tracking-widest uppercase mb-6">
            Service de Livraison
          </h1>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-[#999999] text-sm leading-relaxed max-w-xl mx-auto">
            Nous livrons partout au Sénégal avec des délais adaptés à chaque région.
          </p>
        </div>

        {/* Zones de livraison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {zones.map((zone) => (
            <div
              key={zone.name}
              className="border border-[#8B7355]/30 p-8 hover:border-[#D4AF37]/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-serif tracking-widest uppercase text-white">
                  {zone.name}
                </h2>
                <span className="text-[#D4AF37] text-xs tracking-widest uppercase border border-[#D4AF37]/40 px-2 py-0.5">
                  {zone.delay}
                </span>
              </div>
              <p className="text-3xl font-serif text-[#D4AF37] mb-2">
                {zone.price.toLocaleString()} <span className="text-base text-[#8B7355]">FCFA</span>
              </p>
              <p className="text-[#666666] text-xs tracking-wide mb-4">Frais de livraison fixes</p>
              <div className="border-t border-[#333333] pt-4">
                <p className="text-[#999999] text-xs mb-2 uppercase tracking-widest">Régions couvertes</p>
                <p className="text-[#cccccc] text-sm leading-relaxed">
                  {zone.regions.join(' · ')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Processus */}
        <div className="mb-16">
          <h2 className="text-xl font-serif tracking-widest uppercase text-center mb-10">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Passez commande',
                desc: 'Sélectionnez vos articles, renseignez votre adresse et confirmez votre commande.',
              },
              {
                step: '02',
                title: 'Confirmation',
                desc: 'Vous recevez une confirmation par SMS ou WhatsApp avec le récapitulatif de votre commande.',
              },
              {
                step: '03',
                title: 'Livraison',
                desc: 'Notre livreur vous contacte avant de se déplacer. Vous payez à la réception.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-[#D4AF37] font-serif text-4xl mb-4">{item.step}</div>
                <h3 className="text-sm font-serif tracking-widest uppercase mb-3">{item.title}</h3>
                <p className="text-[#666666] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Infos importantes */}
        <div className="border border-[#8B7355]/30 p-8 mb-16">
          <h2 className="text-lg font-serif tracking-widest uppercase mb-6">À savoir</h2>
          <ul className="space-y-4">
            {[
              'Le paiement s\'effectue uniquement en espèces à la livraison.',
              'Les délais sont indicatifs et peuvent varier selon la disponibilité.',
              'Vous serez contacté par téléphone ou WhatsApp pour coordonner la livraison.',
              'En cas d\'absence lors de la livraison, un nouveau passage sera planifié.',
              'Les commandes sont traitées du lundi au samedi, de 8h à 18h.',
            ].map((info, i) => (
              <li key={i} className="flex items-start gap-3 text-[#999999] text-sm">
                <span className="text-[#D4AF37] mt-0.5 shrink-0">—</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-[#666666] text-sm mb-4">Une question sur votre livraison ?</p>
          <a
            href={CONTACT_INFO.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[#D4AF37] text-[#D4AF37] px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black transition-colors"
          >
            Contactez-nous sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;
