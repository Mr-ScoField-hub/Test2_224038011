import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../config/firebase';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const cartRef = ref(database, `carts/${userId}`);
      
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const items = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));
          setCartItems(items);
          const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalCount);
        } else {
          setCartItems([]);
          setCartCount(0);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setCartItems([]);
      setCartCount(0);
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, loading }}>
      {children}
    </CartContext.Provider>
  );
};