import React, { useState, useEffect, useCallback } from 'react';
import { LS, updateOrderStatus } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { Check, X, Truck, PackageCheck, FileText } from 'lucide-react';

const AdminPending = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('pending'); // pending, approved, dispatched
    const [orders, setOrders] = useState([]);

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalAction, setModalAction] = useState(null); // 'dispatch', 'deliver'
    const [formData, setFormData] = useState({ qty: '', vehicleNo: '', expectedDate: '', proof: '', receivedBy: '' });

    const refreshData = useCallback(() => {
        setOrders(LS.get('ri_orders'));
    }, []);

    useEffect(() => {
        refreshData();
        const handler = () => refreshData();
        window.addEventListener('ri_data_changed', handler);
        return () => window.removeEventListener('ri_data_changed', handler);
    }, [refreshData]);

    if (user?.role !== 'admin') {
        return <div className="p-10 text-center text-indigo-500 font-bold">Access Denied: Admin Only</div>;
    }

    const handleApprove = (id) => updateOrderStatus(id, 'APPROVED', { by: user.id });
    const handleReject = (id) => updateOrderStatus(id, 'REJECTED', { by: user.id, reason: 'Admin Rejected' });

    const openDispatchModal = (order) => {
        setSelectedOrder(order);
        setModalAction('dispatch');
        setFormData({ qty: order.quantity, vehicleNo: '', expectedDate: '', proof: '', receivedBy: '' });
    };

    const openDeliverModal = (order) => {
        setSelectedOrder(order);
        setModalAction('deliver');
        setFormData({ qty: '', vehicleNo: '', expectedDate: '', proof: '', receivedBy: '' });
    };

    const submitModal = () => {
        if (modalAction === 'dispatch') {
            const dispatchedQty = Math.min(Math.max(Number(formData.qty) || 0, 0), selectedOrder.quantity);
            updateOrderStatus(selectedOrder.order_id, 'DISPATCHED', {
                dispatchedQty,
                vehicleNo: formData.vehicleNo,
                expectedDate: formData.expectedDate,
                by: user.id
            });
        } else if (modalAction === 'deliver') {
            updateOrderStatus(selectedOrder.order_id, 'DELIVERED', {
                proof: formData.proof,
                receivedBy: formData.receivedBy,
                by: user.id
            });
        }
        setModalAction(null);
        setSelectedOrder(null);
    };

    const filteredOrders = () => {
        switch (activeTab) {
            case 'pending': return orders.filter(o => o.status === 'PENDING');
            case 'approved': return orders.filter(o => o.status === 'APPROVED');
            case 'dispatched': return orders.filter(o => o.status === 'DISPATCHED');
            default: return [];
        }
    };

    return (
        <>
            <div className="space-y-4 animate-fade-in-up pb-10">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">Admin Console</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Control Center</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-100 pb-0.5 overflow-x-auto custom-scrollbar">
                    {['pending', 'approved', 'dispatched'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 capitalize font-black text-[10px] tracking-widest rounded-t-2xl transition-all duration-300 border-x border-t whitespace-nowrap ${activeTab === tab
                                ? 'bg-white text-indigo-600 border-slate-100 -mb-[2px] shadow-sm'
                                : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {`${tab} Orders`}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    <div className="space-y-4 pb-12">
                            {filteredOrders().length === 0 && (
                                <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No orders in this status</p>
                                </div>
                            )}
                            {filteredOrders().map(order => (
                                <div key={order.order_id} className="glass-card p-6 md:flex items-center justify-between group">
                                    <div className="mb-4 md:mb-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-black text-slate-900 tracking-tight">{order.order_id}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium">
                                            Product: <span className="text-slate-900 font-bold">{order.product_name || order.product_id}</span> {order.variant_name ? <span className="text-indigo-600 font-bold">({order.variant_name})</span> : null} × {order.quantity}
                                        </p>
                                        <p className="text-sm text-slate-600 font-medium">
                                            Amount: <span className="text-indigo-600 font-black">₹{order.amount}</span> <span className="text-[10px] uppercase font-black text-slate-400 ml-1">({order.paymentType})</span>
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 px-2 py-0.5 bg-slate-50 rounded-md inline-block border border-slate-100">User: {order.customer_id}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {activeTab === 'pending' && (
                                            <>
                                                <button onClick={() => handleApprove(order.order_id)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button onClick={() => handleReject(order.order_id)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 border-2 border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'approved' && (
                                            <button onClick={() => openDispatchModal(order)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/20">
                                                <Truck size={14} /> Dispatch
                                            </button>
                                        )}
                                        {activeTab === 'dispatched' && (
                                            <button onClick={() => openDeliverModal(order)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-indigo-500/20">
                                                <PackageCheck size={14} /> Mark Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                </div>
            </div>

            {/* Modal Overlay - Moved outside the animated container to fix positioning */}
            {modalAction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in-up border border-white/20">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            {modalAction === 'dispatch' ? <Truck size={32} /> : <PackageCheck size={32} />}
                        </div>
                        
                        <h3 className="text-xl font-black text-slate-900 tracking-tight text-center mb-8 uppercase">
                            {modalAction === 'dispatch' ? 'Disptach Confirmation' : 'Delivery Confirmation'}
                        </h3>

                        <div className="space-y-6">
                            {modalAction === 'dispatch' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            Dispatch Qty <span className="normal-case text-slate-300">(of {selectedOrder?.quantity} ordered)</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={selectedOrder?.quantity}
                                            className="glass-input w-full font-bold text-slate-700"
                                            placeholder="Quantity being dispatched"
                                            value={formData.qty}
                                            onChange={e => setFormData({ ...formData, qty: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vehicle Details</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full font-bold text-slate-700"
                                            placeholder="e.g. MH-12-AB-1234"
                                            value={formData.vehicleNo}
                                            onChange={e => setFormData({ ...formData, vehicleNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Delivery Date</label>
                                        <input
                                            type="date"
                                            className="glass-input w-full font-bold text-slate-700"
                                            value={formData.expectedDate}
                                            onChange={e => setFormData({ ...formData, expectedDate: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {modalAction === 'deliver' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Receiver Name</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full font-bold text-slate-700"
                                            placeholder="Who received the package?"
                                            value={formData.receivedBy}
                                            onChange={e => setFormData({ ...formData, receivedBy: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proof of Delivery</label>
                                        <input
                                            type="text"
                                            className="glass-input w-full font-bold text-slate-700"
                                            placeholder="Note or Photo Link"
                                            value={formData.proof}
                                            onChange={e => setFormData({ ...formData, proof: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-6">
                                <button onClick={() => setModalAction(null)} className="flex-1 py-4 bg-white text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all border border-slate-100">Cancel Action</button>
                                <button onClick={submitModal} className="flex-1 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/20">Process Final</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPending;
