import React from 'react';
import { CONTACT_INFO } from '@/lib/constants';

const ReturnsPage = () => {
  const sections = [
    {
      title: 'Conditions de retour',
      items: [
        'Les retours sont acceptés dans un délai de 7 jours suivant la réception de votre commande.',
        'Les articles doivent être retournés dans leur état d\'origine, non portés, non lavés et avec leurs étiquettes.',
        'Les articles défectueux ou endommagés lors de la livraison sont échangés sans frais.',
        'Les articles de la catégorie Beauté & Soin ne peuvent pas être retournés pour des raisons d\'hygiène.',
        'Les articles en promotion finale ne sont pas éligibles au retour.',
      ],
    },
    {
      title: 'Procédure d\'échange',
      items: [
        'Contactez notre service client via WhatsApp ou par téléphone dans les 7 jours suivant la livraison.',
        'Décrivez le problème et joignez des photos si nécessaire.',
        'Notre équipe vous confirme l\'éligibilité de la demande sous 24h.',
        'Un livreur passe récupérer l\'article et livre le remplacement simultanément.',
        'L\'échange est sans frais supplémentaires si l\'article est défectueux.',
      ],
    },
    {
      title: 'Remboursements',
      items: [
        'En cas d\'indisponibilité du produit souhaité en échange, un avoir est émis.',
        'L\'avoir est valable 30 jours sur l\'ensemble de notre catalogue.',
        'Aucun remboursement en espèces n\'est effectué.',
        'Les frais de livraison initiaux ne sont pas remboursés sauf en cas d\'erreur de notre part.',
      ],
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Politique</p>
          <h1 className="text-3xl md:text-4xl font-serif tracking-widest uppercase mb-6">
            Retours & Échanges
          </h1>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-[#999999] text-sm leading-relaxed max-w-xl mx-auto">
            Votre satisfaction est notre priorité. Nous nous engageons à traiter chaque demande avec soin et rapidité.
          </p>
        </div>

        {/* Délai mis en avant */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { value: '7 jours', label: 'pour initier un retour' },
            { value: '24h', label: 'pour valider votre demande' },
            { value: 'Gratuit', label: 'pour tout article défectueux' },
          ].map((stat) => (
            <div key={stat.label} className="border border-[#8B7355]/30 p-6 text-center">
              <p className="text-2xl font-serif text-[#D4AF37] mb-2">{stat.value}</p>
              <p className="text-[#666666] text-xs uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-10 mb-16">
          {sections.map((section) => (
            <div key={section.title} className="border-t border-[#333333] pt-8">
              <h2 className="text-base font-serif tracking-widest uppercase mb-6 text-white">
                {section.title}
              </h2>
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#999999] text-sm leading-relaxed">
                    <span className="text-[#D4AF37] mt-0.5 shrink-0">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Articles non éligibles */}
        <div className="border border-[#8B7355]/30 bg-[#0a0a0a] p-8 mb-16">
          <h2 className="text-base font-serif tracking-widest uppercase mb-6">Articles non éligibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Produits de beauté & cosmétiques ouverts',
              'Sous-vêtements et articles d\'hygiène',
              'Articles personnalisés ou sur mesure',
              'Produits en promotion finale (-50% et plus)',
              'Articles avec étiquettes retirées',
              'Produits endommagés par le client',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[#666666] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B7355] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-[#666666] text-sm mb-2">Pour initier un retour ou un échange :</p>
          <p className="text-white text-sm mb-6">
            Contactez-nous dans les 7 jours suivant la réception de votre commande.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={CONTACT_INFO.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-[#D4AF37] text-[#D4AF37] px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="inline-block border border-[#8B7355]/40 text-[#8B7355] px-8 py-3 text-xs tracking-widest uppercase hover:border-[#8B7355] transition-colors"
            >
              {CONTACT_INFO.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
