import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getCustomerProfile, saveContactInfo, addCustomerAddress } from '../utils/LSHelpers';
import {
    Minus, Plus, Trash2, ShoppingBag, ArrowLeft, User, MapPin, CreditCard,
    AlertCircle, Check, X, Save
} from 'lucide-react';

const PAYMENT_METHODS = ['UPI', 'Credit/Debit Card', 'Net Banking', 'Cash on Delivery', 'Wallets'];
const emptyAddressForm = { label: '', houseNo: '', street: '', landmark: '', city: '', state: '', pincode: '', country: 'India' };

const formatAddress = (a) => [a.houseNo, a.street, a.landmark, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ');

const inputClass = "glass-input w-full text-sm";

const Field = ({ label, required, children }) => (
    <div>
        <label className="text-[11px] font-bold text-slate-500 block mb-1">
            {label} {required && <span className="text-indigo-500">*</span>}
        </label>
        {children}
    </div>
);

const Cart = () => {
    const { cart, updateQty, removeFromCart, clearCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [contact, setContact] = useState({ fullName: '', mobile: '', email: '', whatsapp: '' });
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [paymentType, setPaymentType] = useState('Cash on Delivery');

    const [touched, setTouched] = useState(false);

    // Change-address modal
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addressForm, setAddressForm] = useState(emptyAddressForm);
    const [pickedAddressId, setPickedAddressId] = useState(null);

    // Order confirmation disclaimer modal
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const profile = getCustomerProfile(user.id);
        setContact({
            fullName: profile?.fullName || user.name || '',
            mobile: profile?.mobile || '',
            email: profile?.email || '',
            whatsapp: profile?.whatsapp || '',
        });
        const savedAddresses = profile?.addresses || [];
        setAddresses(savedAddresses);
        setSelectedAddressId(profile?.defaultAddressId || savedAddresses[0]?.id || null);
    }, [user]);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;
    const isAddressComplete = !!selectedAddress;

    const openAddressModal = () => {
        setPickedAddressId(selectedAddressId);
        setShowAddForm(addresses.length === 0);
        setAddressForm(emptyAddressForm);
        setAddressModalOpen(true);
    };

    const handleUseAddress = () => {
        if (pickedAddressId) {
            setSelectedAddressId(pickedAddressId);
            setAddressModalOpen(false);
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        const created = addCustomerAddress(user.id, addressForm);
        setAddresses(prev => [...prev, created]);
        setSelectedAddressId(created.id);
        setAddressModalOpen(false);
    };

    const handlePlaceOrder = () => {
        if (cart.length === 0) return;
        if (!isAddressComplete) {
            setTouched(true);
            return;
        }

        // Show confirmation popup with required disclaimer
        setConfirmModalOpen(true);
    };

    const executePlaceOrder = () => {
        setConfirmModalOpen(false);
        const deliveryAddressText = formatAddress(selectedAddress);

        cart.forEach(item => {
            const order = {
                order_id: 'O' + Date.now() + Math.floor(Math.random() * 1000),
                customer_id: user.id,
                product_id: item.product_id,
                product_name: item.name,
                variant_id: item.variant_id || null,
                variant_name: item.variant_name || null,
                quantity: item.qty,
                amount: item.price * item.qty,
                address: deliveryAddressText,
                addressLabel: selectedAddress.label || null,
                customerName: contact.fullName,
                mobile: contact.mobile,
                email: contact.email,
                whatsapp: contact.whatsapp,
                paymentType,
                scheme_id: null,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                history: [{ status: 'PENDING', at: new Date().toISOString(), by: user.id }]
            };
            createOrder(order);
        });

        saveContactInfo(user.id, contact);
        clearCart();
        navigate('/orders');
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                <ShoppingBag size={48} className="text-slate-300 mb-4" />
                <h2 className="text-lg font-black text-slate-700">Your cart is empty</h2>
                <p className="text-sm text-slate-400 mt-1 mb-6">Browse products and add items to get started.</p>
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
        <>
        <div className="space-y-6 animate-fade-in-up pb-24">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all"
            >
                <ArrowLeft size={14} /> Continue Shopping
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    {/* Items */}
                    <div className="glass-panel p-4 md:p-6 space-y-3">
                        <h2 className="text-lg font-black text-slate-800 mb-2">Your Cart ({cart.length})</h2>
                        {cart.map(item => {
                            const itemId = item.cart_id || item.product_id;
                            return (
                                <div key={itemId} className="flex flex-wrap sm:flex-nowrap items-center gap-4 p-3 bg-white/60 rounded-2xl border border-slate-100">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                                        onError={(e) => { e.target.src = 'https://placehold.co/100' }}
                                    />
                                    <div className="flex-1 min-w-[120px]">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                                        {item.variant_name && (
                                            <span className="inline-block text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-0.5">
                                                Variant: {item.variant_name}
                                            </span>
                                        )}
                                        <p className="text-xs text-slate-400 mt-0.5">&#8377;{item.price} / unit</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1">
                                        <button onClick={() => updateQty(itemId, item.qty - 1)} className="p-1.5 text-slate-500 hover:text-indigo-600">
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-6 text-center text-sm font-black text-slate-800">{item.qty}</span>
                                        <button onClick={() => updateQty(itemId, item.qty + 1)} className="p-1.5 text-slate-500 hover:text-indigo-600">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span className="w-20 text-right font-black text-slate-900 text-sm">&#8377;{(item.price * item.qty).toLocaleString()}</span>
                                    <button onClick={() => removeFromCart(itemId)} className="text-slate-300 hover:text-indigo-600 p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Checkout form */}
                    <div className="glass-panel p-4 md:p-6 space-y-6">
                        {/* 1. Customer Details */}
                        <div className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wide">
                                <User size={16} className="text-indigo-600" /> 1. Customer Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Full Name" required>
                                    <input className={inputClass} value={contact.fullName} onChange={e => setContact({ ...contact, fullName: e.target.value })} />
                                </Field>
                                <Field label="Mobile Number" required>
                                    <input className={inputClass} value={contact.mobile} onChange={e => setContact({ ...contact, mobile: e.target.value })} />
                                </Field>
                                <Field label="Email Address">
                                    <input type="email" className={inputClass} value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} />
                                </Field>
                                <Field label="WhatsApp Number">
                                    <input className={inputClass} value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} />
                                </Field>
                            </div>
                        </div>

                        {/* 2. Delivery Address */}
                        <div className="space-y-3 pt-5 border-t border-dashed border-slate-200">
                            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wide">
                                <MapPin size={16} className="text-indigo-600" /> 2. Delivery Address
                            </h3>

                            {selectedAddress ? (
                                <div className="flex items-start justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-white/60">
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{selectedAddress.label || 'Delivery Address'}</p>
                                        <p className="text-xs text-slate-500 leading-relaxed">{formatAddress(selectedAddress)}</p>
                                    </div>
                                    <button
                                        onClick={openAddressModal}
                                        className="shrink-0 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-all"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className={`p-4 rounded-2xl border ${touched ? 'border-blue-300 bg-blue-50/40' : 'border-dashed border-slate-200 bg-white/60'}`}>
                                    <p className="text-xs text-slate-500 mb-3">No delivery address selected yet.</p>
                                    <button
                                        onClick={openAddressModal}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                    >
                                        <Plus size={14} /> Add Delivery Address
                                    </button>
                                </div>
                            )}
                            {touched && !isAddressComplete && (
                                <p className="text-[10px] text-indigo-500 font-bold">Please add and select a delivery address to continue.</p>
                            )}
                            <p className="text-[10px] text-slate-400">
                                Manage all your saved addresses anytime from <Link to="/profile" className="text-indigo-600 font-bold hover:underline">My Profile</Link>.
                            </p>
                        </div>

                        {/* 3. Payment */}
                        <div className="space-y-3 pt-5 border-t border-dashed border-slate-200">
                            <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 uppercase tracking-wide">
                                <CreditCard size={16} className="text-indigo-600" /> 3. Payment
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map(method => (
                                    <label
                                        key={method}
                                        className={`cursor-pointer border rounded-lg p-2.5 text-center text-[11px] font-bold transition-all ${paymentType === method ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200'}`}
                                    >
                                        <input type="radio" className="hidden" checked={paymentType === method} onChange={() => setPaymentType(method)} />
                                        {method}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-[340px] glass-panel p-6 space-y-4 h-fit lg:sticky lg:top-24">
                    <h2 className="text-lg font-black text-slate-800">Order Summary</h2>
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                        <span>&#8377;{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 text-sm">
                        <span className="font-bold text-slate-500">Total</span>
                        <span className="font-black text-xl text-slate-900">&#8377;{cartTotal.toLocaleString()}</span>
                    </div>

                    {touched && !isAddressComplete && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            Please add a delivery address before placing the order.
                        </div>
                    )}

                    <button
                        onClick={handlePlaceOrder}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all uppercase text-xs tracking-widest"
                    >
                        Place Order
                    </button>
                </div>
            </div>
        </div>

            {/* Change / Add Address Modal */}
            {addressModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                {showAddForm ? 'Add New Address' : 'Choose Delivery Address'}
                            </h3>
                            <button onClick={() => setAddressModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {!showAddForm ? (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    {addresses.map((a, i) => (
                                        <label
                                            key={a.id}
                                            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${pickedAddressId === a.id ? 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-200' : 'border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            <input
                                                type="radio"
                                                className="mt-1"
                                                checked={pickedAddressId === a.id}
                                                onChange={() => setPickedAddressId(a.id)}
                                            />
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-wide mb-1">{a.label || `Address ${i + 1}`}</p>
                                                <p className="text-xs text-slate-500 leading-relaxed">{formatAddress(a)}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <button
                                    onClick={() => { setAddressForm(emptyAddressForm); setShowAddForm(true); }}
                                    className="flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-all"
                                >
                                    <Plus size={14} /> Add New Address
                                </button>

                                <button
                                    onClick={handleUseAddress}
                                    disabled={!pickedAddressId}
                                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all uppercase tracking-widest text-xs mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Check size={18} /> Use This Address
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAddAddress} className="space-y-4">
                                {addresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all mb-2"
                                    >
                                        <ArrowLeft size={14} /> Back to saved addresses
                                    </button>
                                )}
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
                                <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all uppercase tracking-widest text-xs mt-2">
                                    <Save size={18} /> Save & Use This Address
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Order Confirmation Disclaimer Modal */}
            {confirmModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-6 md:p-8 animate-fade-in-up border border-slate-100 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <AlertCircle size={26} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Confirm Your Order</h3>
                                <p className="text-xs text-slate-400 font-medium">Please review the notice below</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                            <p className="text-sm font-medium text-amber-950 leading-relaxed">
                                <span className="font-black text-amber-800">Note: </span>
                                Prices and availability shown are indicative and may vary. Final price and availability will be confirmed at the time of order processing.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModalOpen(false)}
                                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={executePlaceOrder}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/30 text-xs uppercase tracking-wider transition-all"
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Cart;
