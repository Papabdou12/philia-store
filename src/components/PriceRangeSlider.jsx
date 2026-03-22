
import React, { useState, useEffect, useRef } from 'react';

const PriceRangeSlider = ({ min, max, step, value, onValueChange, className = '' }) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const rangeRef = useRef(null);

  // Sync internal state with external value prop
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(value);
    minValRef.current = value;
    onValueChange([value, maxVal]);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(value);
    maxValRef.current = value;
    onValueChange([minVal, value]);
  };

  const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className={`relative w-full h-12 flex items-center ${className}`}>
      {/* Background Track */}
      <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full z-0" />
      
      {/* Active Range Track */}
      <div 
        ref={rangeRef}
        className="absolute h-2 bg-[#C9A84C] rounded-full z-10"
        style={{
          left: `${getPercent(minVal)}%`,
          width: `${getPercent(maxVal) - getPercent(minVal)}%`
        }}
      />

      {/* Min Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="price-slider absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20"
      />

      {/* Max Input — styles des thumbs dans index.css (.price-slider) */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="price-slider absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-30"
      />

    </div>
  );
};

export default PriceRangeSlider;
