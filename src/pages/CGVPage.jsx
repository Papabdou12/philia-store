import React, { useState } from 'react';
import { CONTACT_INFO } from '@/lib/constants';

const CGVPage = () => {
  const [open, setOpen] = useState(null);

  const articles = [
    {
      id: 1,
      title: 'Objet et champ d\'application',
      content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Philia'Store, boutique en ligne sénégalaise domiciliée à Dakar, Sénégal, et tout client effectuant un achat sur notre plateforme.

Tout achat implique l'acceptation pleine et entière des présentes CGV. Philia'Store se réserve le droit de modifier ces conditions à tout moment, les nouvelles versions étant applicables dès leur mise en ligne.`,
    },
    {
      id: 2,
      title: 'Produits et disponibilité',
      content: `Les produits proposés sont ceux qui figurent dans le catalogue en ligne au moment de la consultation. Chaque produit est accompagné d'une description et d'un prix en Francs CFA (FCFA).

Philia'Store s'engage à proposer uniquement des produits en stock. En cas d'indisponibilité après validation de commande, le client est informé dans les plus brefs délais et peut opter pour un article de remplacement ou l'annulation de sa commande.`,
    },
    {
      id: 3,
      title: 'Prix et paiement',
      content: `Tous les prix sont exprimés en Francs CFA (FCFA) toutes taxes comprises. Les frais de livraison sont indiqués lors de la validation de la commande et varient selon la zone géographique.

Le règlement s'effectue exclusivement en espèces au moment de la livraison (paiement à la livraison). D'autres modes de paiement (Wave, Orange Money, Free Money) seront disponibles prochainement.

Philia'Store se réserve le droit de modifier ses tarifs à tout moment. Les produits sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande.`,
    },
    {
      id: 4,
      title: 'Commandes',
      content: `La commande est validée après confirmation des informations de livraison et du récapitulatif. Un numéro de commande est attribué automatiquement.

Philia'Store se réserve le droit d'annuler toute commande en cas de stock insuffisant, d'erreur manifeste de prix, ou de suspicion de fraude, avec information immédiate du client.

Toute commande validée constitue un contrat de vente entre le client et Philia'Store.`,
    },
    {
      id: 5,
      title: 'Livraison',
      content: `La livraison est assurée sur l'ensemble du territoire sénégalais selon les tarifs et délais suivants :
— Dakar Express : 2 500 FCFA, délai 24h
— Régions du Sénégal : 5 000 FCFA, délai 48-72h

Les délais sont indicatifs et courent à compter de la confirmation de commande. Philia'Store décline toute responsabilité en cas de retard dû à des circonstances indépendantes de sa volonté.`,
    },
    {
      id: 6,
      title: 'Retours et échanges',
      content: `Les retours sont acceptés dans un délai de 7 jours suivant la réception, pour des articles en parfait état avec étiquettes. Les articles de beauté & soin, les sous-vêtements et les articles en promotion finale sont exclus du droit de retour.

En cas d'article défectueux, l'échange est effectué sans frais supplémentaires. Pour les échanges standards, les frais de livraison du retour sont à la charge du client.

Pour plus de détails, consultez notre page Retours & Échanges.`,
    },
    {
      id: 7,
      title: 'Données personnelles',
      content: `Les données collectées (nom, téléphone, adresse) sont utilisées exclusivement pour le traitement des commandes et la gestion de la relation client.

Conformément aux lois en vigueur au Sénégal, ces données ne sont pas transmises à des tiers sans consentement préalable. Le client dispose d'un droit d'accès, de rectification et de suppression de ses données en nous contactant par email.`,
    },
    {
      id: 8,
      title: 'Responsabilité et litiges',
      content: `Philia'Store ne saurait être tenu responsable des dommages indirects résultant de l'utilisation des produits vendus. Notre responsabilité est limitée au montant de la commande concernée.

En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord, les juridictions sénégalaises compétentes seront saisies, le droit sénégalais étant applicable.`,
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4">Légal</p>
          <h1 className="text-3xl md:text-4xl font-serif tracking-widest uppercase mb-6">
            Conditions Générales de Vente
          </h1>
          <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-[#666666] text-xs">
            Dernière mise à jour : Mars 2025 · Philia'Store, Dakar, Sénégal
          </p>
        </div>

        {/* Intro */}
        <div className="border-l-2 border-[#D4AF37]/40 pl-6 mb-12">
          <p className="text-[#999999] text-sm leading-relaxed">
            En passant commande sur Philia'Store, vous acceptez les présentes conditions générales de vente.
            Nous vous invitons à les lire attentivement avant tout achat.
          </p>
        </div>

        {/* Articles accordion */}
        <div className="space-y-2 mb-16">
          {articles.map((article) => (
            <div key={article.id} className="border border-[#333333] hover:border-[#8B7355]/40 transition-colors">
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                onClick={() => setOpen(open === article.id ? null : article.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#D4AF37] font-serif text-sm w-6 shrink-0">
                    {String(article.id).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-serif tracking-wide uppercase text-white">
                    {article.title}
                  </span>
                </div>
                <span className="text-[#8B7355] text-lg shrink-0 ml-4">
                  {open === article.id ? '−' : '+'}
                </span>
              </button>
              {open === article.id && (
                <div className="px-6 pb-6 border-t border-[#333333]">
                  <p className="text-[#999999] text-sm leading-relaxed pt-5 whitespace-pre-line">
                    {article.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="border border-[#8B7355]/30 p-8 text-center">
          <h2 className="text-sm font-serif tracking-widest uppercase mb-4">Contact</h2>
          <p className="text-[#666666] text-sm mb-6">
            Pour toute question relative à ces conditions :
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs">
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="text-[#D4AF37] hover:underline tracking-wide"
            >
              {CONTACT_INFO.email}
            </a>
            <span className="hidden sm:block text-[#333333]">·</span>
            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="text-[#D4AF37] hover:underline tracking-wide"
            >
              {CONTACT_INFO.phone}
            </a>
            <span className="hidden sm:block text-[#333333]">·</span>
            <span className="text-[#666666]">{CONTACT_INFO.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGVPage;
