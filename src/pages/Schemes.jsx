import React, { useState, useEffect, useCallback } from 'react';
import { LS, createScheme } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { Tag, Calendar, Gift, Plus, X, Check, History, Trash2 } from 'lucide-react';

const Schemes = () => {
    const { user } = useAuth();
    const [schemes, setSchemes] = useState([]);
    const [products, setProducts] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        discountPercent: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
    });

    const [selectedProductIds, setSelectedProductIds] = useState([]);

    const refreshData = useCallback(() => {
        setSchemes(LS.get('ri_schemes'));
        setProducts(LS.get('ri_products'));
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const toggleProductSelection = (pid) => {
        setSelectedProductIds(prev =>
            prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
        );
    };

    const handleDeactivate = (id) => {
        if (!window.confirm("Are you sure you want to deactivate this scheme? It will move to history.")) return;

        const current = LS.get('ri_schemes');
        const idx = current.findIndex(s => s.scheme_id === id);
        if (idx > -1) {
            // Set validTo to yesterday to expire it
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            current[idx].validTo = yesterday.toISOString().split('T')[0];
            LS.set('ri_schemes', current);
            refreshData();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.discountPercent || !formData.validTo) return;

        const newScheme = {
            scheme_id: 'S' + Date.now().toString().slice(-4),
            name: formData.name,
            discountPercent: Number(formData.discountPercent),
            validFrom: formData.validFrom,
            validTo: formData.validTo,
            product_ids: selectedProductIds
        };

        createScheme(newScheme);

        refreshData();
        setIsModalOpen(false);
        setFormData({ name: '', discountPercent: '', validFrom: new Date().toISOString().split('T')[0], validTo: '' });
        setSelectedProductIds([]);
    };

    // Filter Logic
    const today = new Date().toISOString().split('T')[0];
    const activeSchemes = schemes.filter(s => s.validTo >= today);
    const expiredSchemes = schemes.filter(s => s.validTo < today);

    const displayedSchemes = showHistory ? expiredSchemes : activeSchemes;

    return (
        <>
            <div className={`space-y-4 animate-fade-in-up pb-12`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Schemes</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Special Discount Programs</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${showHistory
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <History size={16} /> {showHistory ? 'Hide History' : 'View History'}
                        </button>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-[10px] uppercase tracking-widest"
                            >
                                <Plus size={16} /> Launch Scheme
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedSchemes.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass-panel border-dashed border-2 border-slate-200">
                            <Tag size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No schemes found</p>
                        </div>
                    ) : (
                        displayedSchemes.map((scheme) => (
                            <div key={scheme.scheme_id} className={`group relative overflow-hidden glass-card p-6 flex flex-col min-h-[300px] border-none transition-all duration-500 hover:-translate-y-1 ${!showHistory ? 'industrial-gradient' : ''}`}>
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-3xl ${showHistory ? 'bg-slate-100 text-slate-400' : 'bg-white/20 text-white backdrop-blur-xl border border-white/30'}`}>
                                            <Tag size={28} />
                                        </div>
                                        {user?.role === 'admin' && (
                                            <button
                                                onClick={() => handleDeactivate(scheme.scheme_id)}
                                                className="p-2.5 rounded-2xl bg-white/10 text-white/40 hover:bg-blue-500 hover:text-white transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className={`text-2xl font-black mb-1 leading-tight tracking-tight ${showHistory ? 'text-slate-800' : 'text-white'}`}>{scheme.name}</h3>
                                    <p className={`text-xs font-bold mb-6 ${showHistory ? 'text-slate-500' : 'text-white/80'}`}>Get {scheme.discountPercent}% Off on selected products!</p>

                                    <div className="flex flex-wrap gap-1.5 mb-8">
                                        {scheme.product_ids?.slice(0, 5).map((pid, idx) => (
                                            <span key={idx} className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${showHistory ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white/10 text-white border-white/20 backdrop-blur-sm'}`}>{pid}</span>
                                        ))}
                                        {scheme.product_ids?.length > 5 && (
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${showHistory ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white/10 text-white border-white/20 backdrop-blur-sm'}`}>+{scheme.product_ids.length - 5} More</span>
                                        )}
                                    </div>

                                    <div className={`mt-auto pt-6 border-t ${showHistory ? 'border-slate-100' : 'border-white/10'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${showHistory ? 'text-slate-400' : 'text-white/70'}`}>
                                                <Calendar size={14} />
                                                <span>Ends: {scheme.validTo}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-black/10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600">
                                                    <Tag size={16} />
                                                </div>
                                                <span className="font-black font-mono tracking-[0.2em] text-sm uppercase">{scheme.scheme_id}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 px-2 py-1 rounded-lg">Copy Code</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Scheme Modal - Moved outside to fix positioning */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in-up border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">New Launch Promotion</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scheme Name</label>
                                <input
                                    type="text"
                                    className="glass-input w-full font-bold text-slate-700 placeholder:font-medium"
                                    placeholder="e.g. Monsoon Electrical Sale"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount %</label>
                                    <input
                                        type="number"
                                        className="glass-input w-full font-bold text-slate-700"
                                        placeholder="10"
                                        value={formData.discountPercent}
                                        onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        className="glass-input w-full font-bold text-slate-700"
                                        value={formData.validTo}
                                        onChange={e => setFormData({ ...formData, validTo: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Multi-select Dropdown */}
                            <div className="relative space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Applicable Products</label>
                                <div
                                    className="glass-input w-full min-h-[56px] flex flex-wrap gap-2 items-center cursor-pointer p-3 border-2 border-slate-100"
                                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                                >
                                    {selectedProductIds.length === 0 ? (
                                        <span className="text-slate-400 font-medium ml-1">Select products...</span>
                                    ) : (
                                        selectedProductIds.map(pid => (
                                            <span key={pid} className="bg-slate-900 text-white px-3 py-1 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/10">
                                                {pid}
                                                <X size={14} className="cursor-pointer hover:text-indigo-400 transition-colors" onClick={(e) => { e.stopPropagation(); toggleProductSelection(pid); }} />
                                            </span>
                                        ))
                                    )}
                                </div>

                                {isProductDropdownOpen && (
                                    <div className="absolute bottom-full left-0 w-full mb-3 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-64 overflow-y-auto z-[110] custom-scrollbar p-3 animate-fade-in-up">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4 pb-2">Select as many as needed</p>
                                        {products.map(p => (
                                            <div
                                                key={p.product_id}
                                                className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-all rounded-2xl mb-1 ${selectedProductIds.includes(p.product_id) ? 'bg-slate-50' : ''}`}
                                                onClick={() => { toggleProductSelection(p.product_id); }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${selectedProductIds.includes(p.product_id) ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-lg shadow-indigo-500/20' : 'border-slate-200 bg-white'}`}>
                                                        {selectedProductIds.includes(p.product_id) && <Check size={14} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 leading-tight">{p.name}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.product_id}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-slate-900">₹{p.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] shadow-2xl hover:bg-indigo-600 active:scale-95 transition-all mt-4">
                                Deploy Scheme Live
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Schemes;
