// lib/context/CartContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCartData } from '@/lib/services/cart';
import { CartItem } from '@/lib/services/cart';

interface CartContextType {
  cartId: number | undefined;
  itemsInCart: CartItem[];
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<number | undefined>(undefined);
  const [itemsInCart, setItemsInCart] = useState<CartItem[]>([]);

  const refreshCart = async () => {
    try {
      const { cartId, cartItems } = await fetchCartData();
      setCartId(cartId);
      setItemsInCart(cartItems);
      console.log("Cart ID:", cartId);
        console.log("Items in Cart:", itemsInCart);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartId, itemsInCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};