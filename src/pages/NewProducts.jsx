import React, { useState, useEffect, useCallback } from 'react';
import { LS } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Plus, Minus, X, Upload, Image as ImageIcon, Heart, ChevronDown, Trash2, Images } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import SelectVariantModal from '../components/SelectVariantModal';
import ProductImageSlider from '../components/ProductImageSlider';

const NewProducts = () => {
    const { user } = useAuth();
    const { cart, addToCart, updateQty } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');

    // Variant selector modal for customer
    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        mrp: '',
        category: 'Writing Instruments',
        image: '',
        images: [],
        description: '',
        hasVariants: false,
        variants: []
    });

    const loadProducts = useCallback(() => {
        const all = LS.get('ri_products');
        const sorted = [...all].sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));
        setProducts(sorted.slice(0, 20));
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleOrder = (product) => {
        addToCart(product, 1);
    };

    const handleMultipleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => {
                    const currentImages = prev.images || [];
                    const updated = [...currentImages, reader.result];
                    return {
                        ...prev,
                        images: updated,
                        image: updated[0] || ''
                    };
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => {
            const updated = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
            return {
                ...prev,
                images: updated,
                image: updated[0] || ''
            };
        });
    };

    const handleSetPrimaryImage = (indexToPrimary) => {
        setFormData(prev => {
            const list = [...(prev.images || [])];
            if (indexToPrimary < 0 || indexToPrimary >= list.length) return prev;
            const [selected] = list.splice(indexToPrimary, 1);
            const updated = [selected, ...list];
            return {
                ...prev,
                images: updated,
                image: updated[0] || ''
            };
        });
    };

    const handleAddImageUrl = () => {
        const url = imageUrlInput.trim();
        if (!url) return;
        setFormData(prev => {
            const updated = [...(prev.images || []), url];
            return {
                ...prev,
                images: updated,
                image: updated[0] || ''
            };
        });
        setImageUrlInput('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || (!formData.price && !formData.hasVariants)) return;

        let finalPrice = Number(formData.price);
        let finalMrp = formData.mrp ? Number(formData.mrp) : undefined;
        if (formData.hasVariants && formData.variants.length > 0) {
            const lowestPrice = Math.min(...formData.variants.map(v => Number(v.price) || finalPrice));
            if (lowestPrice && lowestPrice !== Infinity) {
                finalPrice = lowestPrice;
            }
        }

        const finalImages = formData.images && formData.images.length > 0
            ? formData.images
            : (formData.image ? [formData.image] : ['https://placehold.co/400?text=' + encodeURIComponent(formData.name)]);
        const primaryImage = finalImages[0];

        const newProduct = {
            product_id: 'P' + Date.now().toString().slice(-4),
            name: formData.name,
            price: finalPrice,
            mrp: finalMrp,
            category: formData.category,
            image: primaryImage,
            images: finalImages,
            launchDate: new Date().toISOString().split('T')[0],
            description: formData.description,
            hasVariants: !!formData.hasVariants,
            variants: formData.hasVariants ? formData.variants : []
        };

        const currentProducts = LS.get('ri_products');
        currentProducts.unshift(newProduct);
        LS.set('ri_products', currentProducts);

        loadProducts();
        window.dispatchEvent(new Event('ri_data_changed'));
        setIsModalOpen(false);
        setFormData({ name: '', price: '', mrp: '', category: 'Writing Instruments', image: '', images: [], description: '', hasVariants: false, variants: [] });
    };

    return (
        <>
            <div className="space-y-4 animate-fade-in-up pb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Star className="text-indigo-500 fill-indigo-500" size={20} /> New Launches
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fresh Arrivals from our Factory</p>
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <Plus size={16} /> Product Launch
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(p => {
                        const cartItem = cart?.find(i => i.product_id === p.product_id && !i.variant_id);
                        const hasVariants = p.hasVariants && p.variants?.length > 0;
                        const discount = p.mrp && Number(p.mrp) > Number(p.price)
                            ? Math.round(((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100)
                            : null;
                        const variantsInCartCount = cart?.filter(i => i.product_id === p.product_id).reduce((sum, i) => sum + i.qty, 0) || 0;

                        return (
                        <div key={p.product_id} className="glass-card group overflow-hidden flex flex-col p-4 border-none transition-all duration-500">
                            <div className="h-44 bg-slate-50 relative overflow-hidden rounded-2xl mb-4">
                                <ProductImageSlider
                                    images={p.images && p.images.length > 0 ? p.images : [p.image]}
                                    name={p.name}
                                />
                                <span className="absolute top-3 left-3 z-20 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-xl tracking-widest uppercase pointer-events-none">New Launch</span>
                                
                                {discount && (
                                    <span className="absolute top-12 left-3 z-20 bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md pointer-events-none">
                                        -{discount}%
                                    </span>
                                )}

                                <button
                                    onClick={() => toggleWishlist(p)}
                                    className={`absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-xl shadow-sm transition-all ${isWishlisted(p.product_id) ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-400 hover:text-indigo-600'}`}
                                    aria-label="Toggle wishlist"
                                >
                                    <Heart size={14} fill={isWishlisted(p.product_id) ? 'currentColor' : 'none'} />
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-black text-slate-900 truncate flex-1 text-sm tracking-tight" title={p.name}>{p.name}</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 px-1.5 py-0.5 bg-slate-100 rounded-md leading-none">{p.category}</span>
                                </div>
                                {p.description && (
                                    <p className="text-[10px] font-medium text-slate-400 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                                )}

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-2">
                                        {p.mrp && Number(p.mrp) > Number(p.price) && (
                                            <span className="text-xs text-slate-400 line-through">
                                                Rs. {p.mrp}
                                            </span>
                                        )}
                                        <span className="font-black text-lg text-slate-900 leading-none">
                                            Rs. {p.price}
                                        </span>
                                    </div>

                                    {hasVariants ? (
                                        <button
                                            onClick={() => {
                                                setSelectedProductForVariant(p);
                                                setIsVariantModalOpen(true);
                                            }}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#3462a6] hover:bg-[#2b528c] text-white rounded-xl transition-all text-xs font-bold shadow-sm active:scale-95 leading-none"
                                        >
                                            <span>Select variant</span>
                                            <ChevronDown size={14} />
                                            {variantsInCartCount > 0 && (
                                                <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                                    ({variantsInCartCount})
                                                </span>
                                            )}
                                        </button>
                                    ) : cartItem ? (
                                        <div className="w-full flex items-center justify-between gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-2 py-1">
                                            <button onClick={() => updateQty(cartItem.cart_id || p.product_id, cartItem.qty - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-white transition-all" aria-label="Decrease quantity">
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-black text-indigo-700">{cartItem.qty}</span>
                                            <button onClick={() => updateQty(cartItem.cart_id || p.product_id, cartItem.qty + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-white transition-all" aria-label="Increase quantity">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleOrder(p)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#3462a6] hover:bg-[#2b528c] text-white rounded-xl transition-all text-xs font-bold shadow-sm active:scale-95 leading-none">
                                            Add to cart
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>

            {/* Launch Product Modal - Moved outside to fix positioning */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-10 animate-fade-in-up border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Industrial Launch Manifest</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Designation</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full font-bold text-slate-700"
                                        placeholder="e.g. Luxor 1852 Highlighter"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            className="glass-input w-full font-bold text-slate-700"
                                            placeholder="22"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            required={!formData.hasVariants}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MRP (₹)</label>
                                        <input
                                            type="number"
                                            className="glass-input w-full font-bold text-slate-700"
                                            placeholder="25"
                                            value={formData.mrp}
                                            onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Enable Variants Section */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                            Enable Variants (Colours, Sizes, etc.)
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Turn on to let customers choose colour or size variants
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.hasVariants}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    hasVariants: checked,
                                                    variants: checked && (!prev.variants || prev.variants.length === 0)
                                                        ? [
                                                            { variant_id: 'v_' + Date.now() + '_1', name: 'Yellow', price: prev.price || '', mrp: prev.mrp || '', inStock: true },
                                                            { variant_id: 'v_' + Date.now() + '_2', name: 'Green', price: prev.price || '', mrp: prev.mrp || '', inStock: true }
                                                        ]
                                                        : prev.variants
                                                }));
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                {formData.hasVariants && (
                                    <div className="space-y-3 pt-3 border-t border-slate-200">
                                        {/* Quick Presets */}
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Quick Add:</span>
                                            {['Yellow', 'Green', 'Pink', 'Blue', 'Black', 'Red', 'S', 'M', 'L', 'XL'].map(preset => (
                                                <button
                                                    key={preset}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            variants: [
                                                                ...(prev.variants || []),
                                                                {
                                                                    variant_id: 'v_' + Date.now() + Math.floor(Math.random() * 100),
                                                                    name: preset,
                                                                    price: prev.price || '',
                                                                    mrp: prev.mrp || '',
                                                                    inStock: true
                                                                }
                                                            ]
                                                        }));
                                                    }}
                                                    className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    + {preset}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Variants list */}
                                        <div className="space-y-2">
                                            {(formData.variants || []).map((v, vIdx) => (
                                                <div key={v.variant_id || vIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                    <div className="flex-1 min-w-[90px]">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Variant</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Yellow"
                                                            value={v.name}
                                                            onChange={e => {
                                                                const next = [...formData.variants];
                                                                next[vIdx].name = e.target.value;
                                                                setFormData({ ...formData, variants: next });
                                                            }}
                                                            className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 focus:outline-none focus:border-indigo-600 bg-transparent"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="w-16">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Price</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Price"
                                                            value={v.price}
                                                            onChange={e => {
                                                                const next = [...formData.variants];
                                                                next[vIdx].price = e.target.value;
                                                                setFormData({ ...formData, variants: next });
                                                            }}
                                                            className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 focus:outline-none focus:border-indigo-600 bg-transparent"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="w-16">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">MRP</label>
                                                        <input
                                                            type="number"
                                                            placeholder="MRP"
                                                            value={v.mrp}
                                                            onChange={e => {
                                                                const next = [...formData.variants];
                                                                next[vIdx].mrp = e.target.value;
                                                                setFormData({ ...formData, variants: next });
                                                            }}
                                                            className="w-full text-xs font-bold text-slate-800 border-b border-slate-200 py-1 focus:outline-none focus:border-indigo-600 bg-transparent"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                                                        <label className="flex items-center gap-1 cursor-pointer text-slate-600">
                                                            <input
                                                                type="checkbox"
                                                                checked={v.inStock !== false}
                                                                onChange={e => {
                                                                    const next = [...formData.variants];
                                                                    next[vIdx].inStock = e.target.checked;
                                                                    setFormData({ ...formData, variants: next });
                                                                }}
                                                                className="rounded text-indigo-600"
                                                            />
                                                            <span className="text-[10px] font-semibold">Stock</span>
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({
                                                                    ...formData,
                                                                    variants: formData.variants.filter((_, i) => i !== vIdx)
                                                                });
                                                            }}
                                                            className="p-1 text-slate-300 hover:text-red-600 transition-colors"
                                                        >
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    variants: [
                                                        ...(prev.variants || []),
                                                        {
                                                            variant_id: 'v_' + Date.now() + Math.floor(Math.random() * 100),
                                                            name: '',
                                                            price: prev.price || '',
                                                            mrp: prev.mrp || '',
                                                            inStock: true
                                                        }
                                                    ]
                                                }));
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 py-1"
                                        >
                                            <Plus size={14} /> Add Another Variant
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                                <select
                                    className="glass-input w-full font-bold text-slate-700 appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Writing Instruments">Writing Instruments</option>
                                    <option value="Pencils & Erasers">Pencils & Erasers</option>
                                    <option value="Notebooks & Registers">Notebooks & Registers</option>
                                    <option value="Paper Products">Paper Products</option>
                                    <option value="School Supplies">School Supplies</option>
                                    <option value="Office Supplies">Office Supplies</option>
                                    <option value="Art & Drawing">Art & Drawing</option>
                                    <option value="Adhesives & Tapes">Adhesives & Tapes</option>
                                    <option value="Desk Accessories">Desk Accessories</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Product Images (Auto-Slide)
                                    </label>
                                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                        {formData.images?.length || 0} {formData.images?.length === 1 ? 'image' : 'images'}
                                    </span>
                                </div>

                                {/* Uploaded images preview gallery */}
                                {formData.images && formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2.5 mb-2">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group/thumb aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                
                                                {/* Badge: Main image indicator */}
                                                {idx === 0 ? (
                                                    <span className="absolute top-1.5 left-1.5 bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                                                        ★ Main
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetPrimaryImage(idx)}
                                                        className="absolute top-1.5 left-1.5 bg-white/90 hover:bg-white text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                                        title="Set as main image"
                                                    >
                                                        Set Main
                                                    </button>
                                                )}

                                                {/* Delete image button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-sm"
                                                    title="Remove image"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Multi-file upload dropzone */}
                                <div className="border-2 border-dashed border-slate-100 hover:border-indigo-300 rounded-[1.5rem] p-5 text-center hover:bg-slate-50 transition-all relative group bg-slate-50/50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center justify-center text-slate-400 py-1 pointer-events-none">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-2">
                                            <Upload size={18} className="text-indigo-500" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Upload Images (Select Multiple)</p>
                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">Images will auto-slide on product card</p>
                                    </div>
                                </div>

                                {/* Paste image URL option */}
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="url"
                                        placeholder="Or paste an image URL..."
                                        value={imageUrlInput}
                                        onChange={e => setImageUrlInput(e.target.value)}
                                        className="glass-input flex-1 text-xs py-2 px-3 font-medium text-slate-700"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddImageUrl();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddImageUrl}
                                        className="px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-black transition-all shrink-0"
                                    >
                                        + Add URL
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Brief</label>
                                <textarea
                                    className="glass-input w-full resize-none font-bold text-slate-700"
                                    rows="2"
                                    placeholder="Brief technical description..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] shadow-2xl hover:bg-indigo-600 active:scale-95 transition-all mt-4 border-none">
                                Commit Product Launch
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Select Variant Modal */}
            <SelectVariantModal
                product={selectedProductForVariant}
                isOpen={isVariantModalOpen}
                onClose={() => {
                    setIsVariantModalOpen(false);
                    setSelectedProductForVariant(null);
                }}
            />
        </>
    );
};
export default NewProducts;
