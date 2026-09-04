import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    if (wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                <Heart size={48} className="text-slate-300 mb-4" />
                <h2 className="text-lg font-black text-slate-700">Your wishlist is empty</h2>
                <p className="text-sm text-slate-400 mt-1 mb-6">Tap the heart on any product to save it here.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up pb-12">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Heart className="text-indigo-500 fill-indigo-500" size={20} /> My Wishlist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map(item => (
                    <div key={item.product_id} className="glass-card group overflow-hidden flex flex-col p-3 border-none transition-all duration-500">
                        <div className="relative h-40 bg-slate-50 overflow-hidden rounded-2xl mb-3">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.target.src = 'https://placehold.co/400?text=Product' }}
                            />
                            <button
                                onClick={() => removeFromWishlist(item.product_id)}
                                className="absolute top-2 left-2 p-2 rounded-xl bg-white/90 backdrop-blur-xl text-indigo-600 shadow-sm hover:bg-white transition-all"
                                aria-label="Remove from wishlist"
                            >
                                <Heart size={14} fill="currentColor" />
                            </button>
                        </div>
                        <h3 className="font-black text-slate-900 mb-1 line-clamp-1 text-sm tracking-tight">{item.name}</h3>
                        <div className="mt-auto space-y-3">
                            <span className="font-black text-base text-slate-900 leading-none">₹{item.price}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => addToCart(item, 1)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
                                >
                                    <ShoppingCart size={14} /> Add to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item.product_id)}
                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
