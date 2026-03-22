
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StickyNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Boutique', path: '/boutique' },
    { name: 'La Maison', path: '/a-propos' },
    { name: 'Contact', path: '/contact' },
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/boutique?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  
  return (
    <nav
      className={`sticky top-0 z-50 transition-minimal bg-white ${
        isScrolled ? 'shadow-sm border-b border-[#8B7355]/20 py-4' : 'border-b border-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Philia'Store"
              className="h-12 w-auto object-contain"
              loading="eager"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-[#333333] hover:text-black font-medium transition-minimal relative group uppercase text-xs tracking-widest"
              >
                {item.name}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>
          
          {/* Icons */}
          <div className="flex items-center space-x-6">
            <button className="hidden md:block hover:text-[#D4AF37] transition-minimal text-black">
              <Search strokeWidth={1.5} className="w-5 h-5" />
            </button>
            
            <Link to="/wishlist" className="hover:text-[#D4AF37] transition-minimal text-black">
              <Heart strokeWidth={1.5} className="w-5 h-5" />
            </Link>
            
            <Link to="/panier" className="hover:text-[#D4AF37] transition-minimal text-black">
              <ShoppingCart strokeWidth={1.5} className="w-5 h-5" />
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-black hover:text-[#D4AF37] transition-minimal"
            >
              {isMobileMenuOpen ? (
                <X strokeWidth={1.5} className="w-6 h-6" />
              ) : (
                <Menu strokeWidth={1.5} className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-white mt-4 border-t border-[#8B7355]/10"
            >
              <div className="py-6 space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[#333333] hover:text-[#D4AF37] transition-minimal uppercase text-xs tracking-widest pb-4 border-b border-[#8B7355]/10"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default StickyNavbar;
