import React, { useState, useEffect, useCallback } from 'react';
import { LS } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Plus, Edit3, Save, X, Upload, ShoppingCart, Check, ArrowLeft } from 'lucide-react';
import Hero from '../components/Hero';

const AllProducts = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [addedId, setAddedId] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedId(product.product_id);
        setTimeout(() => setAddedId(id => (id === product.product_id ? null : id)), 1200);
    };
    // Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // If null, adding new. If set, editing.
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Writing Instruments',
        description: '',
        image: '',
        stock: 100 // Default stock
    });

    const loadData = useCallback(() => {
        const p = LS.get('ri_products').map(item => ({
            ...item,
            stock: item.stock !== undefined ? item.stock : 100 // Ensure stock exists
        }));
        setProducts(p);
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('ri_data_changed', loadData);
        return () => window.removeEventListener('ri_data_changed', loadData);
    }, [loadData]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                category: product.category,
                description: product.description || '',
                image: product.image,
                stock: product.stock !== undefined ? product.stock : 100
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                category: categories[0] || 'Writing Instruments',
                description: '',
                image: '',
                stock: 100
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const current = LS.get('ri_products');

        if (editingProduct) {
            // Edit Mode
            const idx = current.findIndex(p => p.product_id === editingProduct.product_id);
            if (idx > -1) {
                current[idx] = {
                    ...current[idx],
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock)
                };
                LS.set('ri_products', current);
            }
        } else {
            // Add Mode
            const newId = "P" + (current.length + 101).toString().padStart(3, '0');
            const newProduct = {
                product_id: newId,
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
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
    const categoryProducts = activeCategory ? products.filter(p => p.category === activeCategory) : [];

    const openCategory = (cat) => {
        setActiveCategory(cat);
        window.scrollTo({ top: 0 });
    };

    const renderProductCard = (product) => (
        <div key={product.product_id} className="glass-card group overflow-hidden flex flex-col p-3 border-none transition-all duration-500 hover:-translate-y-1">
            <div className="relative h-40 bg-slate-50 overflow-hidden rounded-2xl mb-3">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://placehold.co/400?text=Product' }}
                />
                {user?.role === 'admin' && (
                    <button
                        onClick={() => handleOpenModal(product)}
                        className="absolute top-2 right-2 p-2.5 bg-white/90 backdrop-blur-xl rounded-xl text-slate-400 hover:text-red-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                    >
                        <Edit3 size={14} />
                    </button>
                )}
            </div>
            <div className="flex-1 flex flex-col">
                <h3 className="font-black text-slate-900 mb-0.5 line-clamp-1 text-sm tracking-tight">{product.name}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{product.product_id}</p>

                <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Valuation</span>
                        <span className="font-black text-base text-slate-900 leading-none">₹{product.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="text-[9px] font-black px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 uppercase tracking-widest">
                            Stock: {product.stock}
                        </div>
                        <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-9 h-9 rounded-xl shadow-sm transition-all flex items-center justify-center active:scale-90 ${addedId === product.product_id ? 'bg-emerald-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}
                            title="Add to Cart"
                        >
                            {addedId === product.product_id ? <Check size={16} /> : <ShoppingCart size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="space-y-6 animate-fade-in-up pb-10">
                {!activeCategory && <Hero name={user?.name} />}

                {!activeCategory && user?.role === 'admin' && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <Plus size={16} /> Register Product
                        </button>
                    </div>
                )}

                {activeCategory ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => { setActiveCategory(null); window.scrollTo({ top: 0 }); }}
                            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-red-600 uppercase tracking-widest transition-all"
                        >
                            <ArrowLeft size={14} /> All Categories
                        </button>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{activeCategory}</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{categoryProducts.length} Items</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                            {categoryProducts.map(renderProductCard)}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight mb-4">Explore Our Full Range</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => openCategory(cat)}
                                    className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-slate-100 hover:border-red-200 hover:shadow-lg hover:-translate-y-1 transition-all"
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

                            <div className="grid grid-cols-2 gap-6">
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
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Product Image</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {formData.image ? (
                                        <div className="relative h-40 w-full">
                                            <img src={formData.image} alt="Preview" className="h-full w-full object-contain mx-auto rounded-xl" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold opacity-0 hover:opacity-100 transition-opacity rounded-xl">Change Image</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 py-4">
                                            <Upload size={40} className="mb-3 text-slate-300" />
                                            <p className="font-bold text-sm text-slate-500">Drop your image here</p>
                                            <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}
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

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all uppercase tracking-widest text-xs mt-4">
                                <Save size={20} /> {editingProduct ? 'Update Product' : 'Add Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllProducts;
