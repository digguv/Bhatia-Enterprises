import React, { useState, useEffect, useCallback } from 'react';
import { LS } from '../utils/LSHelpers';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare } from 'lucide-react';

const AdminFeedback = () => {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);

    const loadFeedbacks = useCallback(() => {
        setFeedbacks(LS.get('ri_feedbacks'));
    }, []);

    useEffect(() => {
        loadFeedbacks();
        window.addEventListener('ri_data_changed', loadFeedbacks);
        return () => window.removeEventListener('ri_data_changed', loadFeedbacks);
    }, [loadFeedbacks]);

    if (user?.role !== 'admin') {
        return <div className="p-10 text-center text-indigo-500 font-bold">Access Denied: Admin Only</div>;
    }

    const avgRating = feedbacks.length
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
        : '—';

    return (
        <div className="space-y-4 animate-fade-in-up pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <MessageSquare size={20} className="text-indigo-600" /> Customer Feedback
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{feedbacks.length} Submissions &bull; Avg {avgRating}/5</p>
                </div>
            </div>

            <div className="space-y-4 pb-12">
                {feedbacks.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No feedback submitted yet</p>
                    </div>
                )}
                {feedbacks.map(f => (
                    <div key={f.feedback_id} className="glass-card p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="font-black text-slate-900">{f.name}</span>
                                    {f.contact && (
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{f.contact}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={14}
                                            className={f.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                                        />
                                    ))}
                                    <span className="ml-1 text-[10px] font-black text-slate-400">{f.rating}/5</span>
                                </div>
                                <p className="text-slate-600 text-sm">{f.message}</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminFeedback;
