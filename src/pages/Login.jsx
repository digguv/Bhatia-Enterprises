import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('user');
    const [password, setPassword] = useState('user123'); // Pre-fill for convenience as requested
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const success = login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 relative overflow-hidden industrial-gradient">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-red-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-slate-900/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-sm glass-panel p-6 md:p-8 relative z-10 animate-fade-in-up border-white/60 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] my-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/30 mx-auto mb-4 transform hover:rotate-12 transition-transform duration-500">
                        <Lock size={22} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-xl font-black bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent mb-1 tracking-tighter uppercase">Bhatia Enterprises</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Enterprise Portal Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative group">
                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-all" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="Username"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                        <div className="relative group">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-all" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/40 border-2 border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center animate-shake uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl shadow-xl shadow-slate-900/20 hover:shadow-red-500/40 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
                    >
                        <span>Authorize Access</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">Internal Test Credentials</p>
                    <div className="flex justify-center gap-3">
                        <button
                            className="px-4 py-1.5 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"
                            onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                        >
                            Node ADMIN
                        </button>
                        <button
                            className="px-4 py-1.5 bg-slate-50 hover:bg-red-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 hover:text-red-600 transition-all uppercase tracking-widest"
                            onClick={() => { setUsername('user'); setPassword('user123'); }}
                        >
                            Node USER
                        </button>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-4 left-0 w-full text-center z-10 px-4">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400 flex items-center justify-center gap-2">
                    Powered By
                    <a
                        href="https://www.botivate.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent hover:from-slate-900 hover:to-slate-700 transition-all font-black"
                    >
                        Botivate
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default Login;
