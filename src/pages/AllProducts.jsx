import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LS } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Edit3, Save, X, Upload, ShoppingCart, ArrowLeft, ArrowRight, Heart, ChevronDown, Trash2, Images } from 'lucide-react';
import Hero from '../components/Hero';
import { useWishlist } from '../context/WishlistContext';
import SelectVariantModal from '../components/SelectVariantModal';
import ProductImageSlider from '../components/ProductImageSlider';

const AllProducts = () => {
    const { user } = useAuth();
    const { cart, addToCart, updateQty } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [visibleCategoryCount, setVisibleCategoryCount] = useState(1);
    const loadMoreRef = useRef(null);

    // Variant selector modal for customer
    const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

    // Per-product qty input state (before adding to cart)
    const [qtyInputs, setQtyInputs] = useState({});

    const getQty = (pid) => Math.max(1, Number(qtyInputs[pid]) || 1);

    const setQty = (pid, val) => {
        const n = Math.max(1, Number(val) || 1);
        setQtyInputs(prev => ({ ...prev, [pid]: n }));
    };

    const handleAddToCart = (product) => {
        const qty = getQty(product.product_id);
        addToCart(product, qty);
        // Reset qty input after adding
        setQtyInputs(prev => ({ ...prev, [product.product_id]: 1 }));
    };
    // Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // If null, adding new. If set, editing.
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        mrp: '',
        category: 'Writing Instruments',
        description: '',
        image: '',
        images: [],
        stock: 100, // Default stock
        hasVariants: false,
        variants: []
    });

    const loadData = useCallback(() => {
        const p = LS.get('ri_products').map(item => ({
            ...item,
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image ? [item.image] : []),
            stock: item.stock !== undefined ? item.stock : 100 // Ensure stock exists
        }));
        setProducts(p);
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('ri_data_changed', loadData);
        return () => window.removeEventListener('ri_data_changed', loadData);
    }, [loadData]);

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

    const handleOpenModal = (product = null) => {
        setImageUrlInput('');
        if (product) {
            setEditingProduct(product);
            const productImages = Array.isArray(product.images) && product.images.length > 0
                ? [...product.images]
                : (product.image ? [product.image] : []);

            setFormData({
                name: product.name,
                price: product.price,
                mrp: product.mrp || '',
                category: product.category,
                description: product.description || '',
                image: productImages[0] || product.image || '',
                images: productImages,
                stock: product.stock !== undefined ? product.stock : 100,
                hasVariants: !!product.hasVariants,
                variants: product.variants ? JSON.parse(JSON.stringify(product.variants)) : []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                mrp: '',
                category: categories[0] || 'Writing Instruments',
                description: '',
                image: '',
                images: [],
                stock: 100,
                hasVariants: false,
                variants: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const current = LS.get('ri_products');

        // If variants enabled and has items, ensure product price reflects the first/lowest variant
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
            : (formData.image ? [formData.image] : []);
        const primaryImage = finalImages[0] || formData.image || '';

        const productPayload = {
            ...formData,
            image: primaryImage,
            images: finalImages,
            price: finalPrice,
            mrp: finalMrp,
            stock: Number(formData.stock),
            hasVariants: !!formData.hasVariants,
            variants: formData.hasVariants ? formData.variants : []
        };

        if (editingProduct) {
            // Edit Mode
            const idx = current.findIndex(p => p.product_id === editingProduct.product_id);
            if (idx > -1) {
                current[idx] = {
                    ...current[idx],
                    ...productPayload
                };
                LS.set('ri_products', current);
            }
        } else {
            // Add Mode
            const newId = "P" + (current.length + 101).toString().padStart(3, '0');
            const newProduct = {
                product_id: newId,
                ...productPayload,
                launchDate: new Date().toISOString().split('T')[0]
            };
            current.unshift(newProduct);
            LS.set('ri_products', current);
        }

        window.dispatchEvent(new Event('ri_data_changed'));
        setIsModalOpen(false);
    };

    // Only Admin can see this page content in full mode? 
    // User requested "to admin user also show thsis page", implying customers might see it too?
    // "Add a page... to admin user also show thsis page" -> Usually means Admin-only features.
    // But later "Place order page show all products".
    // I'll assume this page is visible to everyone as a 'Catalog', but only Admin can Add/Edit.

    const categories = [...new Set(products.map(p => p.category))];
    const categoryThumb = (cat) => products.find(p => p.category === cat)?.image;
    const productsByCategory = (cat) => products.filter(p => p.category === cat);

    // Once a category is opened, keep it first and queue the remaining categories
    // right after it so scrolling down keeps revealing more categories to explore.
    const orderedCategories = activeCategory
        ? [activeCategory, ...categories.filter(c => c !== activeCategory)]
        : [];

    const openCategory = (cat) => {
        setActiveCategory(cat);
        setVisibleCategoryCount(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Infinite scroll & scroll detection: reveals the next category as the user scrolls down
    useEffect(() => {
        if (!activeCategory || visibleCategoryCount >= orderedCategories.length) return;

        const checkAndLoadMore = () => {
            const scrollPos = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.scrollHeight - 500;
            if (scrollPos >= threshold) {
                setVisibleCategoryCount(c => Math.min(c + 1, orderedCategories.length));
            }
        };

        // If the initial content isn't tall enough to create a scrollbar, load another category so user can scroll
        if (document.documentElement.scrollHeight <= window.innerHeight + 300) {
            setVisibleCategoryCount(c => Math.min(c + 1, orderedCategories.length));
        }

        window.addEventListener('scroll', checkAndLoadMore, { passive: true });
        window.addEventListener('resize', checkAndLoadMore, { passive: true });

        const node = loadMoreRef.current;
        let observer;
        if (node) {
            observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCategoryCount(c => Math.min(c + 1, orderedCategories.length));
                }
            }, { rootMargin: '600px' });
            observer.observe(node);
        }

        return () => {
            window.removeEventListener('scroll', checkAndLoadMore);
            window.removeEventListener('resize', checkAndLoadMore);
            if (observer) observer.disconnect();
        };
    }, [activeCategory, visibleCategoryCount, orderedCategories.length]);

    const renderProductCard = (product) => {
        const cartItem = cart?.find(i => i.product_id === product.product_id && !i.variant_id);
        const hasVariants = product.hasVariants && product.variants?.length > 0;
        const discount = product.mrp && Number(product.mrp) > Number(product.price)
            ? Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100)
            : null;

        // Check if any variant of this product is in the cart
        const variantsInCartCount = cart?.filter(i => i.product_id === product.product_id).reduce((sum, i) => sum + i.qty, 0) || 0;

        return (
        <div key={product.product_id} className="glass-card group overflow-hidden flex flex-col p-3 border-none transition-all duration-500 hover:-translate-y-1">
            <div className="relative h-44 bg-slate-50 overflow-hidden rounded-2xl mb-3">
                <ProductImageSlider
                    images={product.images && product.images.length > 0 ? product.images : [product.image]}
                    name={product.name}
                />
                
                {/* Discount Badge */}
                {discount && (
                    <span className="absolute top-2 right-2 z-20 bg-slate-900/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md pointer-events-none">
                        -{discount}%
                    </span>
                )}

                <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-2 left-2 z-20 p-2 rounded-xl backdrop-blur-xl shadow-sm transition-all ${isWishlisted(product.product_id) ? 'bg-indigo-600 text-white' : 'bg-white/90 text-slate-400 hover:text-indigo-600'}`}
                    aria-label="Toggle wishlist"
                >
                    <Heart size={14} fill={isWishlisted(product.product_id) ? 'currentColor' : 'none'} />
                </button>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => handleOpenModal(product)}
                        className="absolute bottom-2 right-2 z-20 p-2.5 bg-white/90 backdrop-blur-xl rounded-xl text-slate-400 hover:text-indigo-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                    >
                        <Edit3 size={14} />
                    </button>
                )}
            </div>
            <div className="flex-1 flex flex-col">
                <h3 className="font-black text-slate-900 mb-1 line-clamp-1 text-sm tracking-tight" title={product.name}>
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-[10px] font-medium text-slate-400 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
                )}

                <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2">
                        {product.mrp && Number(product.mrp) > Number(product.price) && (
                            <span className="text-xs text-slate-400 line-through">
                                Rs. {product.mrp}
                            </span>
                        )}
                        <span className="font-black text-base text-slate-900 leading-none">
                            Rs. {product.price}
                        </span>
                    </div>

                    {hasVariants ? (
                        <button
                            onClick={() => {
                                setSelectedProductForVariant(product);
                                setIsVariantModalOpen(true);
                            }}
                            className="w-full py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 text-xs font-bold bg-[#3462a6] hover:bg-[#2b528c] text-white"
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
                            <button
                                onClick={() => updateQty(cartItem.cart_id || product.product_id, cartItem.qty - 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-white transition-all"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-sm font-black text-indigo-700">{cartItem.qty}</span>
                            <button
                                onClick={() => updateQty(cartItem.cart_id || product.product_id, cartItem.qty + 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-indigo-600 hover:bg-white transition-all"
                                aria-label="Increase quantity"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Qty stepper */}
                            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2 py-1">
                                <button
                                    onClick={() => setQty(product.product_id, getQty(product.product_id) - 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-indigo-600 transition-all"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={13} />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={getQty(product.product_id)}
                                    onChange={e => setQty(product.product_id, e.target.value)}
                                    className="flex-1 text-center text-sm font-black text-slate-800 bg-transparent border-none outline-none w-0 min-w-0"
                                    aria-label="Quantity"
                                />
                                <button
                                    onClick={() => setQty(product.product_id, getQty(product.product_id) + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-indigo-600 transition-all"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 text-xs font-bold bg-[#3462a6] hover:bg-[#2b528c] text-white"
                            >
                                Add to cart
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        );
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in-up pb-10">
                {!activeCategory && <Hero name={user?.name} />}

                {!activeCategory && user?.role === 'admin' && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <Plus size={16} /> Register Product
                        </button>
                    </div>
                )}

                {activeCategory ? (
                    <div className="space-y-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
                            <button
                                onClick={() => { setActiveCategory(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-black text-slate-600 hover:text-indigo-600 uppercase tracking-widest transition-all shadow-sm w-fit"
                            >
                                <ArrowLeft size={14} /> All Categories
                            </button>

                            {/* Category pills for fast jumping */}
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1 max-w-full">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => openCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                            cat === activeCategory
                                                ? 'bg-slate-900 text-white shadow-md'
                                                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${cat === activeCategory ? 'bg-indigo-400' : 'bg-slate-300'}`}></span>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {orderedCategories.slice(0, visibleCategoryCount).map((cat, idx) => {
                            const catProducts = productsByCategory(cat);
                            return (
                                <div key={cat} className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-sky-50 shrink-0">
                                                <img
                                                    src={categoryThumb(cat)}
                                                    alt={cat}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/100?text=' + cat }}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{cat}</h3>
                                                    {idx === 0 && (
                                                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{catProducts.length} Items</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                        {catProducts.map(renderProductCard)}
                                    </div>
                                </div>
                            );
                        })}

                        {visibleCategoryCount < orderedCategories.length ? (
                            <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-10 gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                                    Scroll down to explore <strong className="text-indigo-600">{orderedCategories[visibleCategoryCount]}</strong>
                                </div>
                                <button
                                    onClick={() => setVisibleCategoryCount(c => Math.min(c + 1, orderedCategories.length))}
                                    className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-black transition-all shadow-sm flex items-center gap-2"
                                >
                                    Load Next Category ({orderedCategories[visibleCategoryCount]})
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-xs font-bold text-slate-400">
                                You've explored all categories!
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Explore Our Full Range Category Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Explore Our Full Range</h2>
                                <span className="text-xs font-bold text-slate-400">{categories.length} Categories</span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => openCategory(cat)}
                                        className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all text-left"
                                    >
                                        <div className="w-full aspect-square rounded-2xl bg-sky-50 ring-1 ring-slate-100 overflow-hidden">
                                            <img
                                                src={categoryThumb(cat)}
                                                alt={cat}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => { e.target.src = 'https://placehold.co/200?text=Item' }}
                                            />
                                        </div>
                                        <span className="text-[10px] md:text-[11px] font-black text-slate-700 uppercase tracking-wide text-center leading-tight">{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Under Categories: 5 Categories Products Showcase */}
                        <div className="space-y-10 pt-4 border-t border-slate-200/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Featured Categories</h2>
                                    <p className="text-xs text-slate-400 font-medium">Explore top stationery essentials across our most popular categories</p>
                                </div>
                            </div>

                            {categories.slice(0, 5).map(cat => {
                                const catProducts = productsByCategory(cat);
                                return (
                                    <div key={cat} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-slate-200 bg-sky-50 shrink-0">
                                                    <img
                                                        src={categoryThumb(cat)}
                                                        alt={cat}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=' + cat }}
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{cat}</h3>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{catProducts.length} Items</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openCategory(cat)}
                                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 text-xs font-black transition-all shadow-sm group"
                                            >
                                                <span>View All</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                                            {catProducts.slice(0, 5).map(renderProductCard)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Manage Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Product Name</label>
                                <input
                                    type="text"
                                    className="glass-input w-full font-semibold text-slate-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full font-semibold text-slate-700"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">MRP (₹)</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full font-semibold text-slate-700"
                                        value={formData.mrp}
                                        placeholder="Optional"
                                        onChange={e => setFormData({ ...formData, mrp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Stock Qty</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full font-semibold text-slate-700"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
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

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Category</label>
                                <select
                                    className="glass-input w-full font-semibold text-slate-700"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Product Images (Auto-Slide)
                                    </label>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                        {formData.images?.length || 0} {formData.images?.length === 1 ? 'image' : 'images'}
                                    </span>
                                </div>

                                {/* Uploaded images preview gallery */}
                                {formData.images && formData.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2.5 mb-3">
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

                                {/* Upload file dropzone (multiple supported) */}
                                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center hover:bg-slate-50/60 transition-all relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                        <Upload size={28} className="mb-2 text-indigo-500" />
                                        <p className="font-black text-xs text-slate-700">Click or drag images to upload (Multiple supported)</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP. Images will automatically slide on product card.</p>
                                    </div>
                                </div>

                                {/* Paste image URL option */}
                                <div className="flex items-center gap-2 mt-2.5">
                                    <input
                                        type="url"
                                        placeholder="Or paste an image URL here..."
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
                                        className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-black transition-all shrink-0"
                                    >
                                        + Add URL
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Description</label>
                                <textarea
                                    className="glass-input w-full h-28 resize-none font-medium text-slate-600"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all uppercase tracking-widest text-xs mt-4">
                                <Save size={20} /> {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Select Variant Bottom Sheet Modal for Customers */}
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

export default AllProducts;
