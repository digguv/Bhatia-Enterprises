import React, { useState, useEffect, useCallback } from 'react';
import { LS } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, IndianRupee, Package, ShoppingBag, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

const Dashboard = () => {
    const { user } = useAuth();
    const [targetData, setTargetData] = useState({ target: 0, achieved: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [newProducts, setNewProducts] = useState([]);

    const loadData = useCallback(() => {
        if (!user) return;

        // Targets
        const targets = LS.get('ri_targets');
        // Find target for this user. Fallback to dummy if missing.
        const t = targets.find(x => x.user_id === user.id) || { target: 50000, achieved: 0 };
        setTargetData(t);

        // Orders
        const allOrders = LS.get('ri_orders');
        const userOrders = user.role === 'admin' ? allOrders : allOrders.filter(o => o.customer_id === user.id);
        setRecentOrders(userOrders.slice(0, 5));

        // Products
        const allProducts = LS.get('ri_products');
        // Sort by launch date desc
        const sortedProds = [...allProducts].sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));
        setNewProducts(sortedProds.slice(0, 3));
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
        window.addEventListener('ri_data_changed', loadData);
        return () => window.removeEventListener('ri_data_changed', loadData);
    }, [loadData]);

    const balance = Math.max(0, targetData.target - targetData.achieved);
    const percentage = targetData.target > 0 ? Math.round((targetData.achieved / targetData.target) * 100) : 0;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    return (
        <motion.div 
            className="space-y-6 pb-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Target Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={90} className="text-slate-900" />
                    </div>
                    <h3 className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-1">Monthly Target</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-black text-slate-400">₹</span>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{targetData.target.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                        <motion.div 
                            className="bg-slate-900 h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group border-emerald-100/30">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IndianRupee size={90} className="text-emerald-600" />
                    </div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-emerald-500/80 font-black uppercase tracking-widest text-[9px]">Achieved</h3>
                        {percentage >= 100 && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-black text-emerald-400">₹</span>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">{targetData.achieved.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 w-full bg-emerald-50 rounded-full h-1 overflow-hidden">
                        <motion.div 
                            className="bg-emerald-500 h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                        />
                    </div>
                    <p className="text-[9px] text-emerald-600 mt-2 font-black uppercase tracking-wider">{percentage}% Completed</p>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card p-6 relative overflow-hidden group border-orange-100/30">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package size={90} className="text-orange-600" />
                    </div>
                    <h3 className="text-orange-500/80 font-black uppercase tracking-widest text-[9px] mb-1">Balance Goal</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-black text-orange-400">₹</span>
                        <p className="text-3xl font-black text-orange-500 tracking-tighter">{balance.toLocaleString()}</p>
                    </div>
                    <div className="mt-4">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
                            {percentage >= 100 ? 'Performance Optimized' : 'Mission Completion Required'}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* New Product Launch Section */}
            <motion.div variants={itemVariants} className="glass-panel p-6 md:p-8 relative overflow-hidden border-none shadow-none bg-slate-50/50">
                <div className="flex items-end justify-between mb-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-1 bg-indigo-600 rounded-full" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Inventory</h4>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Latest Innovations</h2>
                    </div>
                    <Link to="/new-products" className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">
                        Catalog <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {newProducts.map((product) => (
                        <motion.div 
                            key={product.product_id} 
                            whileHover={{ y: -5 }}
                            className="group bg-white rounded-3xl overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500"
                        >
                            <div className="h-40 overflow-hidden relative">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    onError={(e) => { e.target.src = 'https://placehold.co/400?text=Product' }} 
                                />
                                <span className="absolute top-4 right-4 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl">New Arrival</span>
                            </div>
                            <div className="p-6">
                                <h4 className="font-black text-slate-800 mb-0.5 group-hover:text-indigo-600 transition-colors truncate text-base tracking-tight">{product.name}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">Stock Ready</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Valuation</span>
                                        <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">₹{product.price.toLocaleString()}</span>
                                    </div>
                                    <Link to="/all-products">
                                        <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-500 flex items-center justify-center shadow-inner group-hover:shadow-xl group-hover:shadow-slate-900/20">
                                            <ShoppingBag size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Orders Preview */}
            <motion.div variants={itemVariants} className="glass-panel p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter">Recent Logistics</h2>
                    <Link to="/orders" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Audit Full History</Link>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100/50">
                                <th className="pb-3 pl-2">Ref ID</th>
                                <th className="pb-3">Timestamp</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3 text-right pr-2">Valuation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentOrders.map((order) => (
                                <tr key={order.order_id} className="group hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="py-4 pl-2">
                                        <span className="text-[10px] font-black text-slate-900 tabular-nums uppercase">{order.order_id}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all duration-500 ${
                                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white' :
                                            order.status === 'DISPATCHED' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-500 group-hover:text-white' :
                                            order.status === 'APPROVED' ? 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-500 group-hover:text-white' :
                                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-500 group-hover:text-white' :
                                            'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right pr-2">
                                        <span className="text-xs font-black text-slate-900 tracking-tighter tabular-nums">₹{order.amount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
