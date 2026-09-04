import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ri_cart';

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return parsed.map(item => ({ ...item, cart_id: item.cart_id || item.product_id }));
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product, qty = 1, variant = null) => {
        const cart_id = variant ? `${product.product_id}::${variant.variant_id}` : product.product_id;
        setCart(prev => {
            const idx = prev.findIndex(item => item.cart_id === cart_id);
            if (idx > -1) {
                const next = [...prev];
                next[idx] = { ...next[idx], qty: next[idx].qty + qty };
                return next;
            }
            return [...prev, {
                cart_id,
                product_id: product.product_id,
                variant_id: variant?.variant_id || null,
                variant_name: variant?.name || null,
                name: product.name,
                price: variant ? Number(variant.price) : product.price,
                image: product.image,
                category: product.category,
                qty
            }];
        });
    }, []);

    const updateQty = useCallback((cart_id, qty) => {
        setCart(prev => {
            if (qty <= 0) return prev.filter(item => item.cart_id !== cart_id);
            return prev.map(item => item.cart_id === cart_id ? { ...item, qty } : item);
        });
    }, []);

    const removeFromCart = useCallback((cart_id) => {
        setCart(prev => prev.filter(item => item.cart_id !== cart_id));
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
