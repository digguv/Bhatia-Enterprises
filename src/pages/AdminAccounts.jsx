import React, { useState, useEffect, useCallback } from 'react';
import { LS, updateUserStatus } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { Check, X, RotateCcw, Ban, Users } from 'lucide-react';

const AdminAccounts = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('pending'); // pending, active, deactivated
    const [users, setUsers] = useState([]);

    const refreshData = useCallback(() => {
        setUsers(LS.get('ri_users').filter(u => u.role !== 'admin'));
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshData();
        const handler = () => refreshData();
        window.addEventListener('ri_data_changed', handler);
        return () => window.removeEventListener('ri_data_changed', handler);
    }, [refreshData]);

    if (user?.role !== 'admin') {
        return <div className="p-10 text-center text-indigo-500 font-bold">Access Denied: Admin Only</div>;
    }

    const statusOf = (u) => u.status || 'active';

    const handleVerify = (id) => updateUserStatus(id, 'active');
    const handleReject = (id) => updateUserStatus(id, 'deactivated');
    const handleDeactivate = (id) => updateUserStatus(id, 'deactivated');
    const handleReactivate = (id) => updateUserStatus(id, 'active');

    const filteredUsers = () => users.filter(u => statusOf(u) === activeTab);

    return (
        <div className="space-y-4 animate-fade-in-up pb-10">
            <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">Manage Accounts</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verify, Deactivate & Reactivate Customer Accounts</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-100 pb-0.5 overflow-x-auto custom-scrollbar">
                {['pending', 'active', 'deactivated'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 capitalize font-black text-[10px] tracking-widest rounded-t-2xl transition-all duration-300 border-x border-t whitespace-nowrap ${activeTab === tab
                            ? 'bg-white text-indigo-600 border-slate-100 -mb-[2px] shadow-sm'
                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {`${tab} Accounts`}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                <div className="space-y-4 pb-12">
                    {filteredUsers().length === 0 && (
                        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No accounts in this status</p>
                        </div>
                    )}
                    {filteredUsers().map(u => (
                        <div key={u.id} className="glass-card p-6 md:flex items-center justify-between group">
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-black text-slate-900 tracking-tight">{u.name}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">@{u.id}</span>
                                </div>
                                <p className="text-sm text-slate-600 font-medium">
                                    Mobile: <span className="text-slate-900 font-bold">{u.mobile || '—'}</span>
                                    {u.email ? <> &middot; Email: <span className="text-slate-900 font-bold">{u.email}</span></> : null}
                                </p>
                                {u.createdAt && (
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 px-2 py-0.5 bg-slate-50 rounded-md inline-block border border-slate-100">
                                        Joined: {new Date(u.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTab === 'pending' && (
                                    <>
                                        <button onClick={() => handleVerify(u.id)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                                            <Check size={14} /> Verify
                                        </button>
                                        <button onClick={() => handleReject(u.id)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 border-2 border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                                            <X size={14} /> Reject
                                        </button>
                                    </>
                                )}
                                {activeTab === 'active' && (
                                    <button onClick={() => handleDeactivate(u.id)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-slate-900/20">
                                        <Ban size={14} /> Deactivate
                                    </button>
                                )}
                                {activeTab === 'deactivated' && (
                                    <button onClick={() => handleReactivate(u.id)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-indigo-500/20">
                                        <RotateCcw size={14} /> Reactivate
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminAccounts;
