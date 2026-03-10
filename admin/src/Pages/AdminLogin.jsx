import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets'; 
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminLogin = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
            const response = await axios.post(`${backendUrl}/api/admin/login`, { email, password });
            
            if (response.data.success) {
                setToken(response.data.token);
                // localStorage handled by App.jsx useEffect
                toast.success("Welcome back, Admin!");
                navigate('/admin');
            } else {
                toast.error(response.data.message || "Invalid Credentials");
            }
        } catch (error) {
            console.error(error);
            toast.error("Login failed. Check server connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Background Mesh Gradient Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                {/* Branding Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="flex items-center gap-5 mb-5">
                        <motion.img 
                            whileHover={{ rotate: 5 }}
                            src={assets.iste_logo} 
                            alt="ISTE Logo" 
                            className="w-25 h-25 object-contain" 
                        />
                        <div className="w-[1.5px] h-10 bg-slate-300 dark:bg-slate-700" />
                        <motion.img 
                            whileHover={{ scale: 1.05 }}
                            src={assets.sist} 
                            alt="SIST Logo" 
                            className="w-90 h-16 rounded-lg shadow-lg shadow-purple-500/10" 
                        />
                    </div>
                    <h1 className="text-3xl font-russo text-slate-800 dark:text-white tracking-tight text-center">
                        ISTE SIST <span className="text-purple-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">Authorized Administrative Access</p>
                </div>

                {/* Glassmorphism Login Card */}
                <div className="bg-white/70 dark:bg-slate-900/75 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-800/50">
                    <form onSubmit={onSubmitHandler} className="space-y-6">
                        
                        {/* Email Input Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                <input 
                                    type="email" 
                                    placeholder="admin@istesist.com" 
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-white outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all duration-300"
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password Input Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-white outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all duration-300"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Secondary Actions */}
                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600" />
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Remember device</span>
                            </label>
                            <button type="button" className="text-[11px] font-bold text-purple-600 hover:text-purple-700 transition-colors">Forgot Key?</button>
                        </div>

                        {/* Animated Submit Button */}
                        <motion.button 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    ENTER DASHBOARD
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    &copy; 2026 ISTE Student Chapter - Sathyabama Institute
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;