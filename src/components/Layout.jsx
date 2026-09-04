import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import CartBar from './CartBar';
import { Menu, Bell, Search, ShoppingBag, ListOrdered, HelpCircle, LogOut, ChevronDown, User, Tag, CheckCircle, Inbox, MessageSquare } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCustomerProfile, getNotificationsForUser, markNotificationRead, markAllNotificationsRead } from '../utils/LSHelpers';

const timeAgo = (iso) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const notifIcon = (type) => {
    if (type === 'scheme') return Tag;
    if (type === 'complaint') return CheckCircle;
    if (type === 'feedback') return MessageSquare;
    return Bell;
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cartCount, clearCart } = useCart();
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    useEffect(() => {
        if (!user) return;
        const loadNotifications = () => setNotifications(getNotificationsForUser(user.id));
        loadNotifications();
        window.addEventListener('ri_data_changed', loadNotifications);
        return () => window.removeEventListener('ri_data_changed', loadNotifications);
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = (notif) => {
        if (!notif.read) markNotificationRead(notif.id, user.id);
    };

    const handleLogout = () => {
        clearCart();
        logout();
    };

    const profileMenuItems = [
        { icon: User, label: 'My Profile', path: '/profile' },
        { icon: ShoppingBag, label: 'Cart', path: '/cart', badge: cartCount },
        { icon: ListOrdered, label: 'My Orders', path: '/orders' },
        { icon: HelpCircle, label: 'Complaints', path: '/complaints' },
        { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
    ];

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return user?.role === 'admin' ? 'Dashboard' : 'All Products';
            case '/orders': return 'Order History';
            case '/schemes': return 'Active Schemes';
            case '/complaints': return 'Support & Complaints';
            case '/new-products': return 'New Product Launches';
            case '/cart': return 'Your Cart';
            case '/profile': return 'My Profile';
            case '/feedback': return 'Feedback';
            case '/admin/pending': return 'Admin Console';
            case '/admin/feedback': return 'Customer Feedback';
            default: return 'Bhatia Enterprises';
        }
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] selection:bg-indigo-100 selection:text-indigo-900 industrial-gradient">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="min-h-screen flex flex-col transition-all duration-500 ease-in-out">
                <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/40 backdrop-blur-3xl border-b border-white/20 sticky top-0 z-30">
                    <div className="flex items-center gap-3 md:gap-4">
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => setSidebarOpen(o => !o)}
                                className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-600 hover:text-indigo-600 transition-all shadow-sm border border-white"
                                aria-label="Toggle menu"
                            >
                                <Menu size={22} />
                            </button>
                        )}
                        <div className="flex flex-col">
                            <h2 className="text-xl md:text-2xl font-black bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent tracking-tight">{getPageTitle()}</h2>
                            <p className="text-[10px] text-slate-400 font-bold hidden md:block uppercase tracking-wider">Bhatia Enterprises</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/50 rounded-2xl border border-white/60 focus-within:bg-white/80 focus-within:border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all w-64 shadow-inner">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder:text-slate-400 font-bold"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setNotifOpen(o => !o)}
                                    className="relative p-2.5 rounded-2xl bg-white/60 hover:bg-white text-slate-500 hover:text-indigo-600 transition-all border border-white hover:shadow-xl hover:shadow-indigo-500/10"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-white animate-pulse"></span>
                                    )}
                                </button>

                                {notifOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-100 ring-1 ring-slate-900/5 overflow-hidden z-40 animate-fade-in-up">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</p>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => markAllNotificationsRead(user.id)}
                                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-all"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                                    <Inbox size={28} className="text-slate-200 mb-2" />
                                                    <p className="text-xs text-slate-400 font-bold">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map(notif => {
                                                    const Icon = notifIcon(notif.type);
                                                    return (
                                                        <button
                                                            key={notif.id}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-50 last:border-b-0 transition-all hover:bg-slate-50 ${notif.read ? '' : 'bg-indigo-50/40'}`}
                                                        >
                                                            <div className={`p-2 rounded-xl shrink-0 ${notif.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                                                <Icon size={14} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-black text-slate-800 leading-tight">{notif.title}</p>
                                                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{timeAgo(notif.createdAt)}</p>
                                                            </div>
                                                            {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative pl-3 border-l border-slate-200/60" ref={profileRef}>
                                {user?.role === 'admin' ? (
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-slate-800 leading-tight">{displayName || 'Admin'}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{user?.role || 'Guest'}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-base shadow-xl shadow-slate-900/20 ring-2 ring-white">
                                            {displayName?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setProfileOpen(o => !o)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-slate-800 leading-tight">{displayName || 'User'}</p>
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{user?.role || 'Guest'}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-base shadow-xl shadow-slate-900/20 ring-2 ring-white transition-all group-hover:scale-105 cursor-pointer">
                                            {displayName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <ChevronDown size={14} className={`hidden sm:block text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                )}

                                {user?.role !== 'admin' && profileOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 ring-1 ring-slate-900/5 overflow-hidden z-40 animate-fade-in-up">
                                        <div className="py-2">
                                            {profileMenuItems.map(item => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                                                >
                                                    <item.icon size={16} />
                                                    {item.label}
                                                    {!!item.badge && (
                                                        <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="py-2 border-t border-slate-100">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2.5 w-full text-xs font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                            >
                                                <LogOut size={16} />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                <footer className="py-6 text-center border-t border-slate-200/40 mt-auto">
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 flex items-center justify-center gap-2">
                        Powered By 
                        <a 
                            href="https://www.botivate.in" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-transparent hover:from-slate-900 hover:to-slate-700 transition-all font-black"
                        >
                            Botivate
                        </a>
                    </p>
                </footer>
            </div>

            <CartBar />
        </div>
    );
};

export default Layout;
