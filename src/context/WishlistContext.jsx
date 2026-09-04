import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'ri_wishlist';

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }, [wishlist]);

    const isWishlisted = useCallback((product_id) => {
        return wishlist.some(item => item.product_id === product_id);
    }, [wishlist]);

    const toggleWishlist = useCallback((product) => {
        setWishlist(prev => {
            const exists = prev.some(item => item.product_id === product.product_id);
            if (exists) return prev.filter(item => item.product_id !== product.product_id);
            return [...prev, {
                product_id: product.product_id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
            }];
        });
    }, []);

    const removeFromWishlist = useCallback((product_id) => {
        setWishlist(prev => prev.filter(item => item.product_id !== product_id));
    }, []);

    return (
        <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, removeFromWishlist, wishlistCount: wishlist.length }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
