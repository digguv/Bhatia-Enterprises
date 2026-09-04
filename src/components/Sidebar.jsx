import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, Tag, Package2, LogOut, X, Star, ShieldCheck, HelpCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCustomerProfile } from '../utils/LSHelpers';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { clearCart } = useCart();
    const [displayName, setDisplayName] = useState(user?.name || '');

    const handleLogout = () => {
        clearCart();
        logout();
    };

    useEffect(() => {
        if (!user) return;
        const loadName = () => {
            const profile = getCustomerProfile(user.id);
            setDisplayName(profile?.fullName || user.name || '');
        };
        loadName();
        window.addEventListener('ri_data_changed', loadName);
        return () => window.removeEventListener('ri_data_changed', loadName);
    }, [user]);

    // Customers never get a sidebar - it stays hidden with no way to unhide it.
    if (user?.role !== 'admin') return null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShieldCheck, label: 'Admin Pending', path: '/admin/pending' },
        { icon: ListOrdered, label: 'All Orders', path: '/orders' },
        { icon: Package2, label: 'All Products', path: '/all-products' },
        { icon: Tag, label: 'Schemes', path: '/schemes' },
        { icon: HelpCircle, label: 'Complaints', path: '/complaints' },
        { icon: Star, label: 'New Launches', path: '/new-products' },
        { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' }
    ];

    return (
        <>
            <div
                className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 shadow-2xl ring-1 ring-slate-900/5 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full bg-slate-50/20">
                    <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/40 bg-white/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Package2 size={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tighter leading-none text-nowrap">BHATIA</h1>
                                <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-0.5">Enterprises</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'bg-white text-indigo-600 shadow-sm border-white ring-1 ring-slate-200/40'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                    }`}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />}
                                        <item.icon size={18} className={`transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.2)]' : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-110'}`} />
                                        <span className={`text-xs font-bold tracking-tight transition-all duration-300 ${isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-200/40 bg-white/10 backdrop-blur-md">
                        <div className="mb-3 px-2 flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">
                                {user?.role?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-700 truncate capitalize leading-tight">{displayName}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 group border border-transparent hover:border-blue-100"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-xs font-bold tracking-tight">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
