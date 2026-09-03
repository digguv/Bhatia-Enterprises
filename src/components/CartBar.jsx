import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartBar = () => {
    const { cartCount, cartTotal } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    if (!cartCount || location.pathname === '/cart') return null;

    return (
        <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md animate-fade-in-up">
            <button
                onClick={() => navigate('/cart')}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/40 hover:bg-red-600 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingCart size={20} />
                        <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">{cartCount}</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                        {cartCount} item{cartCount > 1 ? 's' : ''} &bull; &#8377;{cartTotal.toLocaleString()}
                    </span>
                </div>
                <span className="flex items-center gap-1 text-xs font-black uppercase tracking-widest shrink-0">
                    View Cart <ArrowRight size={14} />
                </span>
            </button>
        </div>
    );
};

export default CartBar;
