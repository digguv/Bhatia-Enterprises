import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SelectVariantModal = ({ product, isOpen, onClose }) => {
    const { cart, addToCart, updateQty } = useCart();

    if (!isOpen || !product) return null;

    const variants = product.variants || [];

    const getItemInCart = (variant) => {
        const cartId = `${product.product_id}::${variant.variant_id}`;
        return cart.find(item => item.cart_id === cartId);
    };

    const handleAddVariant = (variant) => {
        if (!variant.inStock && variant.inStock !== undefined) return;
        addToCart(product, 1, variant);
    };

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 animate-slide-up sm:animate-fade-in-up max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Select variant
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Product Summary */}
                <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=Product' }}
                    />
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{product.name}</h4>
                        <p className="text-[11px] text-slate-400 capitalize">{product.category}</p>
                    </div>
                </div>

                {/* Variants List */}
                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-2 flex-1">
                    {variants.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">No variants available for this item.</p>
                    ) : (
                        variants.map(variant => {
                            const cartItem = getItemInCart(variant);
                            const isAvailable = variant.inStock !== false;

                            return (
                                <div
                                    key={variant.variant_id}
                                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                        cartItem
                                            ? 'border-indigo-300 bg-indigo-50/40'
                                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                                    }`}
                                >
                                    {/* Variant Info: Name, Price, Strike MRP */}
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-bold text-slate-800 tracking-tight">
                                            {variant.name}
                                        </h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {variant.mrp && Number(variant.mrp) > Number(variant.price) && (
                                                <span className="text-xs text-slate-400 line-through">
                                                    Rs. {variant.mrp}
                                                </span>
                                            )}
                                            <span className="text-sm font-black text-slate-900">
                                                Rs. {variant.price}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stock & Add Button */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`text-xs font-semibold ${
                                            isAvailable ? 'text-emerald-600' : 'text-slate-400'
                                        }`}>
                                            {isAvailable ? 'In stock' : 'Out of stock'}
                                        </span>

                                        {isAvailable && (
                                            <div>
                                                {cartItem ? (
                                                    <div className="flex items-center gap-1.5 bg-white border border-indigo-200 rounded-xl px-1.5 py-1 shadow-sm">
                                                        <button
                                                            onClick={() => updateQty(cartItem.cart_id, cartItem.qty - 1)}
                                                            className="w-6 h-6 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-5 text-center text-xs font-black text-indigo-700">
                                                            {cartItem.qty}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQty(cartItem.cart_id, cartItem.qty + 1)}
                                                            className="w-6 h-6 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddVariant(variant)}
                                                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1"
                                                    >
                                                        <Plus size={13} /> Add
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Note */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Select color or size to add to your order</span>
                    <button
                        onClick={onClose}
                        className="font-bold text-indigo-600 hover:underline"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectVariantModal;
