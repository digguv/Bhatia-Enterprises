import React, { useState, useEffect, useCallback } from 'react';
import { LS, updateOrderStatus } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import {
    Clock, CheckCircle, Truck, Package, XCircle, ChevronDown, ChevronUp,
    PackageCheck, Search, ArrowLeft
} from 'lucide-react';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Customer-only search / date filter + category grouping
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const loadOrders = useCallback(() => {
        if (!user) return;
        const all = LS.get('ri_orders');
        const myOrders = user.role === 'admin' ? all : all.filter(o => o.customer_id === user.id);
        setOrders(myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setProducts(LS.get('ri_products'));
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadOrders();
        window.addEventListener('ri_data_changed', loadOrders);
        return () => window.removeEventListener('ri_data_changed', loadOrders);
    }, [loadOrders]);

    const handleCancel = (e, orderId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to cancel this order?')) {
            updateOrderStatus(orderId, 'CANCELLED', { by: user.id });
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrder(expandedOrder === id ? null : id);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={16} className="text-amber-500" />;
            case 'APPROVED': return <CheckCircle size={16} className="text-cyan-500" />;
            case 'DISPATCHED': return <Truck size={16} className="text-blue-500" />;
            case 'DELIVERED': return <Package size={16} className="text-emerald-500" />;
            case 'REJECTED': return <XCircle size={16} className="text-indigo-500" />;
            case 'CANCELLED': return <XCircle size={16} className="text-slate-500" />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'APPROVED': return 'bg-cyan-50 text-cyan-600 border-cyan-200';
            case 'DISPATCHED': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'REJECTED': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            case 'CANCELLED': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getProduct = (id) => products.find(p => p.product_id === id);
    const getCategory = (id) => getProduct(id)?.category || 'Other';

    const getFulfillment = (order) => {
        const totalQty = order.quantity;
        if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
            return { totalQty, receivedQty: 0, pendingQty: 0, label: order.status === 'CANCELLED' ? 'Cancelled' : 'Rejected' };
        }
        let receivedQty = 0;
        if (order.status === 'DISPATCHED' || order.status === 'DELIVERED') {
            const dispatchEntry = order.history?.find(h => h.status === 'DISPATCHED');
            receivedQty = dispatchEntry?.dispatchedQty ?? totalQty;
        }
        const pendingQty = totalQty - receivedQty;
        return { totalQty, receivedQty, pendingQty, label: pendingQty > 0 ? 'Pending' : 'Completed' };
    };

    const fulfillmentColor = (label) => {
        switch (label) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
            case 'Rejected': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            default: return 'bg-amber-50 text-amber-600 border-amber-200';
        }
    };

    // ---------------------------------------------------------------
    // Admin view: unchanged flat list of every order across customers
    // ---------------------------------------------------------------
    if (user?.role === 'admin') {
        return (
            <div className="space-y-6 animate-fade-in-up">
                <h1 className="text-2xl font-bold text-slate-800">All Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                        <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No orders yet</p>
                        <p className="text-sm text-slate-400">Order history will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.order_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
                                <div
                                    className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer gap-4 bg-slate-50/30"
                                    onClick={() => toggleExpand(order.order_id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 hidden sm:block">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{order.order_id}</span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                <span className="font-semibold text-slate-700">{order.product_name || getProduct(order.product_id)?.name || order.product_id}</span>
                                                {order.variant_name && <span className="ml-1.5 font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">({order.variant_name})</span>}
                                                <span className="text-slate-400 ml-1.5">&bull; Qty: {order.quantity}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Amount</p>
                                            <p className="font-bold text-slate-900 text-lg">₹{order.amount}</p>
                                        </div>
                                        {expandedOrder === order.order_id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                    </div>
                                </div>

                                {expandedOrder === order.order_id && (
                                    <div className="p-6 border-t border-slate-100 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Clock size={16} className="text-indigo-500" />
                                                    <h4 className="font-semibold text-slate-800 text-sm">Order Timeline</h4>
                                                </div>
                                                <div className="relative pl-3 border-l-2 border-slate-100 ml-2 space-y-6">
                                                    {order.history.map((h, i) => (
                                                        <div key={i} className="relative pl-6">
                                                            <div className="absolute -left-[9px] top-0 bg-white p-1 rounded-full border border-slate-200 shadow-sm z-10">
                                                                {getStatusIcon(h.status)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-700">{h.status}</span>
                                                                <span className="text-xs text-slate-500">{new Date(h.at).toLocaleString()}</span>
                                                                {h.vehicleNo && <span className="text-xs text-slate-600 mt-1 bg-slate-100 px-2 py-1 rounded w-fit">Vehicle: {h.vehicleNo}</span>}
                                                                {h.proof && <span className="text-xs text-blue-600 mt-1 underline cursor-pointer">View Proof</span>}
                                                                {h.reason && <span className="text-xs text-indigo-500 mt-1 italic">Reason: {h.reason}</span>}
                                                                {h.by && <span className="text-[10px] text-slate-400">By: {h.by}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <h4 className="font-semibold text-slate-800 text-sm mb-2">Delivery Details</h4>
                                                    <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Address:</span> {order.address}</p>
                                                    <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Payment:</span> {order.paymentType}</p>
                                                    {order.scheme_id && <p className="text-sm text-green-600"><span className="font-medium">Scheme:</span> {order.scheme_id}</p>}
                                                    <p className="text-sm text-slate-600 mt-2"><span className="font-medium">Customer:</span> {order.customer_id}</p>
                                                </div>

                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={(e) => handleCancel(e, order.order_id)}
                                                        className="w-full py-3 bg-white border border-indigo-200 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle size={16} /> Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ---------------------------------------------------------------
    // Customer view: search + date filter, grouped by category, table
    // ---------------------------------------------------------------
    const filteredOrders = orders.filter(o => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            const productName = (getProduct(o.product_id)?.name || '').toLowerCase();
            const matches = o.order_id.toLowerCase().includes(lower)
                || o.product_id.toLowerCase().includes(lower)
                || productName.includes(lower);
            if (!matches) return false;
        }
        if (startDate && new Date(o.createdAt) < new Date(startDate)) return false;
        if (endDate && new Date(o.createdAt) > new Date(`${endDate}T23:59:59`)) return false;
        return true;
    });

    const categoryGroups = (() => {
        const map = new Map();
        filteredOrders.forEach(o => {
            const cat = getCategory(o.product_id);
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat).push(o);
        });
        return Array.from(map.entries()).map(([category, list]) => ({
            category,
            orders: list,
            total: list.reduce((s, o) => s + o.amount, 0)
        }));
    })();

    const activeGroup = categoryGroups.find(g => g.category === activeCategory);

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    const renderOrderDetail = (order) => (
        <div className="p-4 md:p-6 bg-slate-50/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Clock size={16} className="text-indigo-500" />
                        <h4 className="font-semibold text-slate-800 text-sm">Order Timeline</h4>
                    </div>
                    <div className="relative pl-3 border-l-2 border-slate-100 ml-2 space-y-4">
                        {order.history.map((h, i) => (
                            <div key={i} className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 bg-white p-1 rounded-full border border-slate-200 shadow-sm z-10">
                                    {getStatusIcon(h.status)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">{h.status}</span>
                                    <span className="text-xs text-slate-500">{new Date(h.at).toLocaleString()}</span>
                                    {h.reason && <span className="text-xs text-indigo-500 mt-1 italic">Reason: {h.reason}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2">Delivery Details</h4>
                        <p className="text-sm text-slate-600 mb-1"><span className="font-medium">Address:</span> {order.address}</p>
                        <p className="text-sm text-slate-600"><span className="font-medium">Payment:</span> {order.paymentType}</p>
                    </div>
                    {order.status === 'PENDING' && (
                        <button
                            onClick={(e) => handleCancel(e, order.order_id)}
                            className="w-full py-2.5 bg-white border border-indigo-200 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
                        >
                            <XCircle size={16} /> Cancel Order
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>

            {/* Filters */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by order ID or product..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="glass-input w-full pl-10 text-sm"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="glass-input text-sm" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="glass-input text-sm" />
                    </div>
                    {(searchTerm || startDate || endDate) && (
                        <button onClick={clearFilters} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-all">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                    <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No orders found</p>
                    <p className="text-sm text-slate-400">Try adjusting your search or date range</p>
                </div>
            ) : activeGroup ? (
                <div className="space-y-4">
                    <button
                        onClick={() => { setActiveCategory(null); setExpandedOrder(null); }}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all"
                    >
                        <ArrowLeft size={14} /> All Categories
                    </button>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-800">{activeGroup.category}</h2>
                        <span className="text-xs font-bold text-slate-400">{activeGroup.orders.length} order{activeGroup.orders.length > 1 ? 's' : ''} &bull; &#8377;{activeGroup.total.toLocaleString()}</span>
                    </div>

                    <div className="glass-panel overflow-x-auto">
                        <table className="w-full text-sm min-w-[820px]">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Total Order Qty</th>
                                    <th className="p-4 text-right">Total Received Qty</th>
                                    <th className="p-4 text-right">Pending Qty</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Amount</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeGroup.orders.map(order => {
                                    const fulfillment = getFulfillment(order);
                                    return (
                                        <React.Fragment key={order.order_id}>
                                            <tr
                                                onClick={() => toggleExpand(order.order_id)}
                                                className="cursor-pointer hover:bg-slate-50/60 border-b border-slate-50 last:border-b-0"
                                            >
                                                <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{order.order_id}</td>
                                                <td className="p-4 text-slate-600">
                                                    <span className="font-medium text-slate-800">{order.product_name || getProduct(order.product_id)?.name || order.product_id}</span>
                                                    {order.variant_name && (
                                                        <span className="block text-xs font-bold text-indigo-600">
                                                            {order.variant_name}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-right text-slate-600">{fulfillment.totalQty}</td>
                                                <td className="p-4 text-right text-slate-600">{fulfillment.receivedQty}</td>
                                                <td className="p-4 text-right text-slate-600">{fulfillment.pendingQty}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${fulfillmentColor(fulfillment.label)}`}>
                                                        {fulfillment.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-900 whitespace-nowrap">₹{order.amount}</td>
                                                <td className="p-4 text-right">
                                                    {expandedOrder === order.order_id ? <ChevronUp size={16} className="text-slate-400 inline" /> : <ChevronDown size={16} className="text-slate-400 inline" />}
                                                </td>
                                            </tr>
                                            {expandedOrder === order.order_id && (
                                                <tr>
                                                    <td colSpan={9} className="p-0">
                                                        {renderOrderDetail(order)}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryGroups.map(group => (
                        <button
                            key={group.category}
                            onClick={() => setActiveCategory(group.category)}
                            className="glass-panel p-5 flex items-center justify-between text-left hover:-translate-y-1 hover:shadow-lg transition-all"
                        >
                            <div>
                                <h3 className="font-black text-slate-800 text-sm mb-1">{group.category}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {group.orders.length} Order{group.orders.length > 1 ? 's' : ''} &bull; &#8377;{group.total.toLocaleString()}
                                </p>
                            </div>
                            <ChevronDown size={18} className="text-slate-300 -rotate-90 shrink-0" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
