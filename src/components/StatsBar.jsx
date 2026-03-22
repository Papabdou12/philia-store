
import React from 'react';

const StatsBar = () => {
  const stats = [
    { label: 'Clients Privilèges', value: '5,000+' },
    { label: 'Créations', value: '500+' },
    { label: 'Régions', value: '14' },
    { label: 'Excellence', value: '4.9★' },
  ];

  return (
    <section className="bg-white py-10 border-y border-[#8B7355]/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 divide-y md:divide-y-0 md:divide-x divide-[#8B7355]/20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center w-full pt-6 md:pt-0">
              <div className="text-3xl font-serif text-black mb-1">
                {stat.value}
              </div>
              <div className="text-[10px] tracking-widest text-[#666666] uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
