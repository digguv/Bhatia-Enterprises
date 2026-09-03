import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getCustomerProfile, saveContactInfo, addCustomerAddress,
    updateCustomerAddress, deleteCustomerAddress, setDefaultAddress
} from '../utils/LSHelpers';
import { User, MapPin, Plus, Edit3, Trash2, Star, X, Save } from 'lucide-react';

const emptyAddressForm = { label: '', houseNo: '', street: '', landmark: '', city: '', state: '', pincode: '', country: 'India' };

const formatAddress = (a) => [a.houseNo, a.street, a.landmark, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ');

const Profile = () => {
    const { user } = useAuth();
    const [contact, setContact] = useState({ fullName: '', mobile: '', email: '', whatsapp: '' });
    const [addresses, setAddresses] = useState([]);
    const [defaultAddressId, setDefaultAddressIdState] = useState(null);
    const [savedFlash, setSavedFlash] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState(emptyAddressForm);

    const load = () => {
        if (!user) return;
        const profile = getCustomerProfile(user.id);
        setContact({
            fullName: profile?.fullName || user.name || '',
            mobile: profile?.mobile || '',
            email: profile?.email || '',
            whatsapp: profile?.whatsapp || '',
        });
        setAddresses(profile?.addresses || []);
        setDefaultAddressIdState(profile?.defaultAddressId || null);
    };

    useEffect(load, [user]);

    const handleSaveContact = () => {
        saveContactInfo(user.id, contact);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
    };

    const openAddModal = () => {
        setEditingAddressId(null);
        setAddressForm(emptyAddressForm);
        setModalOpen(true);
    };

    const openEditModal = (addr) => {
        setEditingAddressId(addr.id);
        setAddressForm({
            label: addr.label || '', houseNo: addr.houseNo || '', street: addr.street || '',
            landmark: addr.landmark || '', city: addr.city || '', state: addr.state || '',
            pincode: addr.pincode || '', country: addr.country || 'India'
        });
        setModalOpen(true);
    };

    const handleSubmitAddress = (e) => {
        e.preventDefault();
        if (editingAddressId) {
            updateCustomerAddress(user.id, editingAddressId, addressForm);
        } else {
            addCustomerAddress(user.id, addressForm);
        }
        setModalOpen(false);
        load();
    };

    const handleDelete = (id) => {
        deleteCustomerAddress(user.id, id);
        load();
    };

    const handleSetDefault = (id) => {
        setDefaultAddress(user.id, id);
        load();
    };

    return (
        <>
        <div className="space-y-6 animate-fade-in-up pb-10 max-w-3xl">
            {/* Contact Details */}
            <div className="glass-panel p-5 md:p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wide">
                    <User size={16} className="text-red-600" /> Contact Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name</label>
                        <input className="glass-input w-full text-sm" value={contact.fullName} onChange={e => setContact({ ...contact, fullName: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Mobile Number</label>
                        <input className="glass-input w-full text-sm" value={contact.mobile} onChange={e => setContact({ ...contact, mobile: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
                        <input type="email" className="glass-input w-full text-sm" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 block mb-1">WhatsApp Number</label>
                        <input className="glass-input w-full text-sm" value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} />
                    </div>
                </div>
                <button
                    onClick={handleSaveContact}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                    <Save size={14} /> {savedFlash ? 'Saved!' : 'Save Details'}
                </button>
            </div>

            {/* Saved Addresses */}
            <div className="glass-panel p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wide">
                        <MapPin size={16} className="text-red-600" /> Saved Addresses
                    </h2>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                        <Plus size={14} /> Add Address
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center">No saved addresses yet. Add one so it's ready to use at checkout.</p>
                ) : (
                    <div className="space-y-3">
                        {addresses.map((a, i) => (
                            <div key={a.id} className={`p-4 rounded-2xl border ${a.id === defaultAddressId ? 'border-red-300 bg-red-50/40' : 'border-slate-100 bg-white/60'}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{a.label || `Address ${i + 1}`}</span>
                                            {a.id === defaultAddressId && (
                                                <span className="flex items-center gap-1 text-[9px] font-black text-red-600 uppercase tracking-widest">
                                                    <Star size={10} className="fill-red-600" /> Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{formatAddress(a)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => openEditModal(a)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-all">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                {a.id !== defaultAddressId && (
                                    <button
                                        onClick={() => handleSetDefault(a.id)}
                                        className="mt-2 text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest transition-all"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitAddress} className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Label (e.g. Home, Work)</label>
                                <input className="glass-input w-full font-semibold text-slate-700" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Home" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">House/Flat No. *</label>
                                    <input required className="glass-input w-full font-semibold text-slate-700" value={addressForm.houseNo} onChange={e => setAddressForm({ ...addressForm, houseNo: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Street/Area *</label>
                                    <input required className="glass-input w-full font-semibold text-slate-700" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Landmark</label>
                                <input className="glass-input w-full font-semibold text-slate-700" value={addressForm.landmark} onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">City *</label>
                                    <input required className="glass-input w-full font-semibold text-slate-700" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">State *</label>
                                    <input required className="glass-input w-full font-semibold text-slate-700" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Pincode *</label>
                                    <input required className="glass-input w-full font-semibold text-slate-700" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Country</label>
                                    <input className="glass-input w-full font-semibold text-slate-700" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-red-600 transition-all uppercase tracking-widest text-xs mt-2">
                                <Save size={18} /> {editingAddressId ? 'Update Address' : 'Save Address'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
