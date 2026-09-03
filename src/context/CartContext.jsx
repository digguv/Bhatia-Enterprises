import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ri_cart';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product, qty = 1) => {
        setCart(prev => {
            const idx = prev.findIndex(item => item.product_id === product.product_id);
            if (idx > -1) {
                const next = [...prev];
                next[idx] = { ...next[idx], qty: next[idx].qty + qty };
                return next;
            }
            return [...prev, {
                product_id: product.product_id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                qty
            }];
        });
    }, []);

    const updateQty = useCallback((product_id, qty) => {
        setCart(prev => {
            if (qty <= 0) return prev.filter(item => item.product_id !== product_id);
            return prev.map(item => item.product_id === product_id ? { ...item, qty } : item);
        });
    }, []);

    const removeFromCart = useCallback((product_id) => {
        setCart(prev => prev.filter(item => item.product_id !== product_id));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartTotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
