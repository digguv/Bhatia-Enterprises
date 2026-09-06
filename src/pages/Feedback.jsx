import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFeedback, getCustomerProfile } from '../utils/LSHelpers';
import { Star, MessageSquare, Send, CheckCircle2, Truck, Package, CreditCard, Headphones, MoreHorizontal } from 'lucide-react';

const FEEDBACK_CATEGORIES = [
    { value: 'Delivery', icon: Truck },
    { value: 'Products', icon: Package },
    { value: 'Payments', icon: CreditCard },
    { value: 'Support', icon: Headphones },
    { value: 'Other', icon: MoreHorizontal },
];

const Feedback = () => {
    const { user } = useAuth();
    const profile = user ? getCustomerProfile(user.id) : null;

    const [name, setName] = useState(profile?.fullName || user?.name || '');
    const [contact, setContact] = useState(profile?.mobile || profile?.email || '');
    const [category, setCategory] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [touched, setTouched] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const isValid = name.trim() && category && rating > 0 && message.trim();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) {
            setTouched(true);
            return;
        }

        createFeedback({
            customer_id: user.id,
            name: name.trim(),
            contact: contact.trim(),
            category,
            rating,
            message: message.trim(),
        });

        setSubmitted(true);
    };

    const handleAnother = () => {
        setCategory('');
        setRating(0);
        setMessage('');
        setTouched(false);
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-lg font-black text-slate-800">Thank you for your feedback!</h2>
                <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm">
                    We've received your rating and comments — it helps us improve.
                </p>
                <button
                    onClick={handleAnother}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
                >
                    Submit Another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in-up pb-10">
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <MessageSquare size={20} className="text-indigo-600" /> Share Your Feedback
                </h1>
                <p className="text-sm text-slate-400 mt-1">Tell us how we're doing — good or bad, we want to hear it.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-5 md:p-6 space-y-5">
                <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Name <span className="text-indigo-500">*</span>
                    </label>
                    <input
                        className="glass-input w-full text-sm"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    {touched && !name.trim() && <p className="text-[10px] text-indigo-500 font-bold mt-1">Name is required</p>}
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Email / Mobile</label>
                    <input
                        className="glass-input w-full text-sm"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        placeholder="Optional"
                    />
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-2">
                        What is this feedback about? <span className="text-indigo-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {FEEDBACK_CATEGORIES.map(({ value, icon: Icon }) => ( // eslint-disable-line no-unused-vars
                            <button
                                key={value}
                                type="button"
                                onClick={() => setCategory(value)}
                                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-[11px] font-bold transition-all ${
                                    category === value
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                            >
                                <Icon size={18} />
                                {value}
                            </button>
                        ))}
                    </div>
                    {touched && !category && <p className="text-[10px] text-indigo-500 font-bold mt-1">Please select a category</p>}
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-2">
                        Rating <span className="text-indigo-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110"
                            >
                                <Star
                                    size={28}
                                    className={(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                                />
                            </button>
                        ))}
                        {rating > 0 && <span className="ml-2 text-sm font-black text-slate-700">{rating}/5</span>}
                    </div>
                    {touched && rating === 0 && <p className="text-[10px] text-indigo-500 font-bold mt-1">Please select a rating</p>}
                </div>

                <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        Feedback <span className="text-indigo-500">*</span>
                    </label>
                    <textarea
                        className="glass-input w-full h-28 resize-none text-sm"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="What did you like? What can we improve?"
                    />
                    {touched && !message.trim() && <p className="text-[10px] text-indigo-500 font-bold mt-1">Feedback message is required</p>}
                </div>

                <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                >
                    <Send size={16} /> Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default Feedback;
