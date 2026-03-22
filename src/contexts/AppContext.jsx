
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('philiastore_cart');
    const savedWishlist = localStorage.getItem('philiastore_wishlist');
    const savedCoupon = localStorage.getItem('philiastore_coupon');
    const savedUser = localStorage.getItem('philiastore_user');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
    
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Error loading wishlist:', e);
      }
    }
    
    if (savedCoupon) {
      try {
        setCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error('Error loading coupon:', e);
      }
    }
    
    if (savedUser) {
      try {
        setUserInfo(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user:', e);
      }
    }
  }, []);
  
  const value = {
    cart,
    setCart,
    wishlist,
    setWishlist,
    coupon,
    setCoupon,
    userInfo,
    setUserInfo,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
