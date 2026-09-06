import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Lock, Phone, Mail, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const cleanUsername = username.trim().toLowerCase();

        if (!name.trim() || !cleanUsername || !mobile.trim() || !password) {
            setError('Please fill all required fields');
            return;
        }
        if (!/^[a-z0-9_.]{3,20}$/.test(cleanUsername)) {
            setError('Username must be 3-20 characters: letters, numbers, dot or underscore only');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = signup({ id: cleanUsername, name: name.trim(), mobile: mobile.trim(), email: email.trim(), password });
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Could not create account');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 relative overflow-hidden industrial-gradient">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-slate-900/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-sm glass-panel p-6 md:p-8 relative z-10 animate-fade-in-up border-white/60 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] my-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mx-auto mb-4 transform hover:rotate-12 transition-transform duration-500">
                        <UserPlus size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent mb-1 tracking-tighter uppercase">Bhatia Enterprises</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Create Your Account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative group">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                        <div className="relative group">
                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="10-digit mobile number"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email <span className="normal-case text-slate-300">(Optional)</span></label>
                        <div className="relative group">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative group">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold text-center animate-shake uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-indigo-500/40 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 group uppercase tracking-widest text-xs mt-1"
                    >
                        <span>Create Account</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-[11px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all">
                        Already have an account? <span className="text-indigo-600">Sign In</span>
                    </Link>
                </div>
            </div>

            <footer className="absolute bottom-4 left-0 w-full text-center z-10 px-4">
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
    );
};

export default Signup;
