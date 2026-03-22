
import React from 'react';

const StarRating = ({ rating }) => {
  return (
    <div className="flex justify-center gap-1">
      {[...Array(5)].map((_, idx) => (
        <span key={idx} className="text-[#D4AF37] text-sm">
          {idx < Math.floor(rating) ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
