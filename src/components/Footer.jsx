
import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO, PAYMENT_METHODS } from '@/lib/constants';

const Footer = () => {
  const shopLinks = [
    { name: 'Mode & Vêtements', path: '/boutique?category=mode' },
    { name: 'Beauté & Soin', path: '/boutique?category=beaute' },
    { name: 'Technologie', path: '/boutique?category=tech' },
    { name: 'Maison & Déco', path: '/boutique?category=maison' },
  ];
  
  const infoLinks = [
    { name: 'À Propos de la Maison', path: '/a-propos' },
    { name: 'Nous Contacter', path: '/contact' },
    { name: 'Service de Livraison', path: '/livraison' },
    { name: 'Retours & Échanges', path: '/retours' },
    { name: 'Conditions Générales', path: '/cgv' },
  ];
  
  return (
    <footer className="bg-off-white text-black pt-20 pb-10 border-t border-[#8B7355]/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Philia'Store"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <h1 className="text-2xl font-serif tracking-widest uppercase" style={{ display: 'none' }}>
                Philia
              </h1>
            </div>
            <p className="text-[#666666] text-sm mb-8 leading-relaxed font-light">
              L'élégance intemporelle. Découvrez notre sélection rigoureuse de créations exceptionnelles.
            </p>
            <div className="flex space-x-6 text-sm text-[#333333]">
              <a href={CONTACT_INFO.instagram} className="hover:text-[#D4AF37] transition-minimal uppercase tracking-widest text-[10px]">Instagram</a>
              <a href={CONTACT_INFO.facebook} className="hover:text-[#D4AF37] transition-minimal uppercase tracking-widest text-[10px]">Facebook</a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-serif mb-6 text-black tracking-widest uppercase">Collections</h4>
            <ul className="space-y-4">
              {shopLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#666666] hover:text-[#D4AF37] transition-minimal text-xs tracking-wide"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-serif mb-6 text-black tracking-widest uppercase">Services</h4>
            <ul className="space-y-4">
              {infoLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-[#666666] hover:text-[#D4AF37] transition-minimal text-xs tracking-wide"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-serif mb-6 text-black tracking-widest uppercase">Contact</h4>
            <ul className="space-y-4 text-[#666666] text-xs tracking-wide">
              <li>{CONTACT_INFO.address}</li>
              <li><a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-[#D4AF37] transition-minimal">{CONTACT_INFO.phone}</a></li>
              <li><a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-[#D4AF37] transition-minimal">{CONTACT_INFO.email}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#8B7355]/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#8B7355] text-xs font-serif italic">
            &copy; {new Date().getFullYear()} Philia. Tous droits réservés.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method.id}
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${
                  method.available
                    ? 'border-[#8B7355]/40 text-[#666666]'
                    : 'border-[#333333] text-[#444444] line-through'
                }`}
                title={method.available ? method.description : 'Bientôt disponible'}
              >
                {method.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
