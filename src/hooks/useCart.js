
import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';

export const useCart = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useCart must be used within AppProvider');
  }
  
  const { cart, setCart, coupon, setCoupon } = context;
  
  const addToCart = (product, variant = {}, quantity = 1) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      variant,
      quantity,
      sku: product.sku,
    };
    
    // Check if item with same variant already exists
    const existingIndex = cart.findIndex(
      item => item.id === product.id && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }
    
    // Save to localStorage
    const updatedCart = existingIndex >= 0 
      ? cart.map((item, i) => i === existingIndex ? {...item, quantity: item.quantity + quantity} : item)
      : [...cart, cartItem];
    localStorage.setItem('philiastore_cart', JSON.stringify(updatedCart));
  };
  
  const removeFromCart = (itemId, variant) => {
    const newCart = cart.filter(
      item => !(item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant))
    );
    setCart(newCart);
    localStorage.setItem('philiastore_cart', JSON.stringify(newCart));
  };
  
  const updateQuantity = (itemId, variant, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, variant);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === itemId && JSON.stringify(item.variant) === JSON.stringify(variant)
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(newCart);
    localStorage.setItem('philiastore_cart', JSON.stringify(newCart));
  };
  
  const applyCoupon = (code) => {
    const validCoupons = {
      'BIENVENUE': { discount: 15, type: 'percentage' },
      'FLASH25': { discount: 25, type: 'percentage' },
      'PROMO10K': { discount: 10000, type: 'fixed' },
    };
    
    const couponData = validCoupons[code.toUpperCase()];
    if (couponData) {
      setCoupon({ code: code.toUpperCase(), ...couponData });
      localStorage.setItem('philiastore_coupon', JSON.stringify({ code: code.toUpperCase(), ...couponData }));
      return true;
    }
    return false;
  };
  
  const removeCoupon = () => {
    setCoupon(null);
    localStorage.removeItem('philiastore_coupon');
  };
  
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getDiscount = () => {
    if (!coupon) return 0;
    
    const subtotal = getCartTotal();
    if (coupon.type === 'percentage') {
      return Math.floor(subtotal * (coupon.discount / 100));
    }
    return coupon.discount;
  };
  
  const getTotal = () => {
    return getCartTotal() - getDiscount();
  };
  
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('philiastore_cart');
  };
  
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    getCartTotal,
    getDiscount,
    getTotal,
    clearCart,
    coupon,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
  };
};
