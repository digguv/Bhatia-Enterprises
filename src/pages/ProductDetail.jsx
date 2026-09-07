import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LS } from '../utils/LSHelpers';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ArrowLeft, Plus, Minus, Heart, ShoppingCart, PackageSearch } from 'lucide-react';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { cart, addToCart, updateQty } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();

    const [products, setProducts] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const load = () => setProducts(LS.get('ri_products'));
        load();
        window.addEventListener('ri_data_changed', load);
        return () => window.removeEventListener('ri_data_changed', load);
    }, []);

    const product = products.find(p => p.product_id === productId);

    // Reset transient view state whenever the viewed product changes (e.g. clicking a related product)
    useEffect(() => {
        if (!product) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveImage(0);
        setQty(1);
        const hasVariants = product.hasVariants && product.variants?.length > 0;
        setSelectedVariant(hasVariants ? (product.variants.find(v => v.inStock !== false) || product.variants[0]) : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [product?.product_id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (products.length > 0 && !product) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                <PackageSearch size={48} className="text-slate-300 mb-4" />
                <h2 className="text-lg font-black text-slate-700">Product not found</h2>
                <p className="text-sm text-slate-400 mt-1 mb-6">This product may have been removed.</p>
                <button
                    onClick={() => navigate('/all-products')}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const hasVariants = product.hasVariants && product.variants?.length > 0;
    const activePrice = selectedVariant ? selectedVariant.price : product.price;
    const activeMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
    const discount = activeMrp && Number(activeMrp) > Number(activePrice)
        ? Math.round(((Number(activeMrp) - Number(activePrice)) / Number(activeMrp)) * 100)
        : null;

    const cartId = hasVariants && selectedVariant ? `${product.product_id}::${selectedVariant.variant_id}` : product.product_id;
    const cartItem = cart?.find(i => i.cart_id === cartId);
    const variantOutOfStock = hasVariants && selectedVariant && selectedVariant.inStock === false;

    const handleAdd = () => {
        if (variantOutOfStock) return;
        addToCart(product, qty, hasVariants ? selectedVariant : null);
        setQty(1);
    };

    // Related products: same category, matching by name/category, excluding this product
    const relatedProducts = products
        .filter(p => p.product_id !== product.product_id && p.category === product.category)
        .slice(0, 12);

    const renderRelatedCard = (p) => {
        const rCartItem = cart?.find(i => i.product_id === p.product_id && !i.variant_id);
        const rDiscount = p.mrp && Number(p.mrp) > Number(p.price)
            ? Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100)
            : null;
        return (
            <div key={p.product_id} className="glass-card group overflow-hidden flex flex-col p-3 border-none transition-all duration-500 hover:-translate-y-1">
                <div
                    className="relative h-36 bg-slate-50 overflow-hidden rounded-2xl mb-3 cursor-pointer"
                    onClick={() => navigate(`/product/${p.product_id}`)}
                >
                    <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://placehold.co/400?text=Product'; }}
                    />
                    {rDiscount && (
                        <span className="absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md pointer-events-none">
                            -{rDiscount}%
                        </span>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                        className={`absolute top-2 left-2 p-2 rounded-xl backdrop-blur-xl shadow-sm transition-all ${isWishlisted(p.product_id) ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-400 hover:text-indigo-600'}`}
                        aria-label="Toggle wishlist"
                    >
                        <Heart size={13} fill={isWishlisted(p.product_id) ? 'currentColor' : 'none'} />
                    </button>
                </div>
                <h3
                    className="font-black text-slate-900 mb-1 line-clamp-1 text-xs tracking-tight cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => navigate(`/product/${p.product_id}`)}
                >
                    {p.name}
                </h3>
                <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-1.5">
                        {p.mrp && Number(p.mrp) > Number(p.price) && (
                            <span className="text-[11px] text-slate-400 line-through">Rs. {p.mrp}</span>
                        )}
                        <span className="font-black text-sm text-slate-900 leading-none">Rs. {p.price}</span>
                    </div>
                    {rCartItem ? (
                        <div className="w-full flex items-center justify-between gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-2 py-1">
                            <button onClick={() => updateQty(rCartItem.cart_id || p.product_id, rCartItem.qty - 1)} className="w-6 h-6 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-white transition-all" aria-label="Decrease quantity">
                                <Minus size={12} />
                            </button>
                            <span className="text-xs font-black text-indigo-700">{rCartItem.qty}</span>
                            <button onClick={() => updateQty(rCartItem.cart_id || p.product_id, rCartItem.qty + 1)} className="w-6 h-6 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-white transition-all" aria-label="Increase quantity">
                                <Plus size={12} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => addToCart(p, 1)}
                            className="w-full py-2 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 text-[11px] font-bold bg-[#3462a6] hover:bg-[#2b528c] text-white"
                        >
                            Add to cart
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-16">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all"
            >
                <ArrowLeft size={14} /> Back
            </button>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Image gallery */}
                <div className="md:w-[42%] shrink-0 space-y-3">
                    <div className="relative aspect-square bg-slate-50 rounded-3xl overflow-hidden">
                        <img
                            src={images[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/500?text=Product'; }}
                        />
                        <button
                            onClick={() => toggleWishlist(product)}
                            className={`absolute top-4 left-4 p-2.5 rounded-xl backdrop-blur-xl shadow-sm transition-all ${isWishlisted(product.product_id) ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-400 hover:text-indigo-600'}`}
                            aria-label="Toggle wishlist"
                        >
                            <Heart size={18} fill={isWishlisted(product.product_id) ? 'currentColor' : 'none'} />
                        </button>
                        {discount && (
                            <span className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                                -{discount}%
                            </span>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${activeImage === idx ? 'border-indigo-500' : 'border-slate-100'}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} view ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=Img'; }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-5">
                    <div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {product.category}
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {activeMrp && Number(activeMrp) > Number(activePrice) && (
                            <span className="text-base text-slate-400 line-through">Rs. {activeMrp}</span>
                        )}
                        <span className="text-3xl font-black text-slate-900">Rs. {activePrice}</span>
                        {discount && (
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {hasVariants && (
                        <div>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Select Option: <span className="text-slate-800 normal-case">{selectedVariant?.name}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map(v => {
                                    const isAvailable = v.inStock !== false;
                                    const isSelected = selectedVariant?.variant_id === v.variant_id;
                                    return (
                                        <button
                                            key={v.variant_id}
                                            disabled={!isAvailable}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                    : isAvailable
                                                        ? 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                                                        : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through'
                                            }`}
                                        >
                                            {v.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {product.description && (
                        <div>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Description</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        {cartItem ? (
                            <div className="flex items-center justify-between gap-3 max-w-xs">
                                <span className="text-xs font-bold text-slate-500">In your cart</span>
                                <div className="flex items-center gap-2 bg-white border border-indigo-200 rounded-xl px-2 py-1.5 shadow-sm">
                                    <button onClick={() => updateQty(cartItem.cart_id, cartItem.qty - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50" aria-label="Decrease quantity">
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-black text-indigo-700">{cartItem.qty}</span>
                                    <button onClick={() => updateQty(cartItem.cart_id, cartItem.qty + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50" aria-label="Increase quantity">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 max-w-md">
                                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1.5">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600" aria-label="Decrease quantity">
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-black text-slate-800">{qty}</span>
                                    <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600" aria-label="Increase quantity">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAdd}
                                    disabled={variantOutOfStock}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#3462a6] hover:bg-[#2b528c] text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart size={16} /> {variantOutOfStock ? 'Out of stock' : 'Add to cart'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related / matching products */}
            {relatedProducts.length > 0 && (
                <div className="pt-6 border-t border-slate-200/60 space-y-4">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Similar Products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {relatedProducts.map(renderRelatedCard)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
