
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CategoryCard = ({ category, large = false }) => {
  return (
    <Link to={`/boutique?category=${category.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-[#000000] border border-[#8B7355] rounded-2xl p-8 h-full min-h-[200px] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all ${
          large ? 'row-span-2' : ''
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#8B7355]/20"></div>
        </div>
        
        <div className="relative z-10">
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
            {category.emoji}
          </div>
          
          <h3 className="text-white text-2xl font-bold mb-2 group-hover:text-[#FFD700] transition-colors" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {category.name}
          </h3>
          
          <p className="text-white/80 text-sm group-hover:text-white transition-colors">
            {category.count} produits
          </p>
        </div>
        
        <div className="relative z-10 flex items-center space-x-2 text-white group-hover:text-[#FFD700] transition-colors mt-4">
          <span className="font-medium uppercase tracking-widest text-xs">Découvrir</span>
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
};

export default CategoryCard;
