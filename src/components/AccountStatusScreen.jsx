import React from 'react';
import { Clock, Ban, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CONTENT = {
    pending: {
        icon: Clock,
        title: 'Admin Verification Pending',
        message: 'Your account has been created and is waiting for admin approval. Once verified, you will be able to explore products and place orders.',
    },
    deactivated: {
        icon: Ban,
        title: 'Account Deactivated',
        message: 'Your account has been deactivated by admin. Please contact support if you believe this is a mistake.',
    },
};

const AccountStatusScreen = ({ status }) => {
    const { logout } = useAuth();
    const { icon: Icon, title, message } = CONTENT[status] || CONTENT.pending;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 relative overflow-hidden industrial-gradient">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-slate-900/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-sm glass-panel p-8 relative z-10 animate-fade-in-up border-white/60 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mx-auto mb-5">
                    <Icon size={28} strokeWidth={2.5} />
                </div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">{title}</h1>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-black py-3.5 rounded-xl shadow-xl shadow-slate-900/20 hover:bg-indigo-600 transition-all uppercase tracking-widest text-xs"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default AccountStatusScreen;
