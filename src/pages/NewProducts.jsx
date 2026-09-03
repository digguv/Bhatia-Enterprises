import React, { useState, useEffect, useCallback } from 'react';
import { LS } from '../utils/LSHelpers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Star, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';

const NewProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Electrical',
        image: '',
        description: ''
    });

    const loadProducts = useCallback(() => {
        const all = LS.get('ri_products');
        const sorted = [...all].sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));
        setProducts(sorted.slice(0, 20));
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleOrder = (id) => {
        navigate('/place-order', { state: { preselectedProductId: id } });
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) return;

        const newProduct = {
            product_id: 'P' + Date.now().toString().slice(-4),
            name: formData.name,
            price: Number(formData.price),
            category: formData.category,
            image: formData.image || 'https://placehold.co/400?text=' + encodeURIComponent(formData.name),
            launchDate: new Date().toISOString().split('T')[0],
            description: formData.description
        };

        const currentProducts = LS.get('ri_products');
        currentProducts.push(newProduct); // Add to end or beginning? Usually new products should be found.
        LS.set('ri_products', currentProducts);

        loadProducts();
        setIsModalOpen(false);
        setFormData({ name: '', price: '', category: 'Electrical', image: '', description: '' });
    };

    return (
        <>
            <div className="space-y-4 animate-fade-in-up pb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Star className="text-red-500 fill-red-500" size={20} /> New Launches
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Fresh Arrivals from our Factory</p>
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <Plus size={16} /> Product Launch
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(p => (
                        <div key={p.product_id} className="glass-card group overflow-hidden flex flex-col p-4 border-none transition-all duration-500">
                            <div className="h-44 bg-slate-50 relative overflow-hidden rounded-2xl mb-4">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.src = 'https://placehold.co/400?text=New+Launch' }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <p className="text-white text-[10px] font-bold line-clamp-2">{p.description}</p>
                                </div>
                                <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-xl tracking-widest uppercase">New Launch</span>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-black text-slate-900 truncate flex-1 text-sm tracking-tight" title={p.name}>{p.name}</h3>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 px-1.5 py-0.5 bg-slate-100 rounded-md leading-none">{p.category}</span>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">Launched {new Date(p.launchDate).toLocaleDateString()}</p>
                                
                                <div className="mt-auto flex justify-between items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Price</span>
                                        <span className="font-black text-lg text-slate-900 leading-none">₹{p.price}</span>
                                    </div>
                                    <button onClick={() => handleOrder(p.product_id)} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-100/50 shadow-sm hover:shadow-xl hover:shadow-red-500/20 active:scale-95 leading-none">
                                        <ShoppingBag size={14} /> Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
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
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Designation</label>
                                    <input
                                        type="text"
                                        className="glass-input w-full font-bold text-slate-700"
                                        placeholder="e.g. Turbo Grinder v2"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Price (₹)</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full font-bold text-slate-700"
                                        placeholder="2500"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                                <select
                                    className="glass-input w-full font-bold text-slate-700 appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Electrical">Electrical</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Tools">Tools</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Safety">Safety</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Asset</label>
                                <div className="border-2 border-dashed border-slate-100 rounded-[1.5rem] p-6 text-center hover:bg-slate-50 transition-all relative group bg-slate-50/50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {formData.image ? (
                                        <div className="relative h-32 w-full">
                                            <img src={formData.image} alt="Preview" className="h-full w-full object-contain mx-auto transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white font-black text-[10px] uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">Modify Asset</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 py-2">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
                                                <Upload size={20} className="text-red-500" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Upload Specification Image</p>
                                            <p className="text-[8px] font-bold text-slate-300 mt-1">PNG, JPG PREFERRED</p>
                                        </div>
                                    )}
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

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] shadow-2xl hover:bg-red-600 active:scale-95 transition-all mt-4 border-none">
                                Commit Product Launch
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
export default NewProducts;
