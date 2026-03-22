
import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';

export const useWishlist = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useWishlist must be used within AppProvider');
  }
  
  const { wishlist, setWishlist } = context;
  
  const addToWishlist = (product) => {
    if (!wishlist.find(item => item.id === product.id)) {
      const newWishlist = [...wishlist, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      }];
      setWishlist(newWishlist);
      localStorage.setItem('philiastore_wishlist', JSON.stringify(newWishlist));
      return true;
    }
    return false;
  };
  
  const removeFromWishlist = (productId) => {
    const newWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(newWishlist);
    localStorage.setItem('philiastore_wishlist', JSON.stringify(newWishlist));
  };
  
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };
  
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };
  
  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('philiastore_wishlist');
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount: wishlist.length,
  };
};
