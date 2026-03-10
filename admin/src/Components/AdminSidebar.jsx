import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { assets } from '../assets/assets'; 
import { 
    LayoutDashboard, 
    CalendarDays, 
    Users, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    Settings,
    ShieldCheck,
    BookImage,
} from 'lucide-react';

/**
 * AdminSidebar Component
 * Includes UI upgrades: Glassmorphism, Framer Motion animations, 
 * Active route indicators, and Tooltips for collapsed state.
 *
 */
const AdminSidebar = ({ setToken, isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();

    // Navigation items configuration
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/admin/events', label: 'Manage Events', icon: CalendarDays },
        { path: '/admin/teams', label: 'Manage Teams', icon: Users },
        { path: '/admin/gallery', label: 'Manage Gallery', icon: BookImage },
        { path: '/admin/feedback', label: 'View Feedback', icon: ShieldCheck },
    ];

    /**
     * Handles user logout by clearing the token state and local storage.
     *
     */
    const handleLogout = () => {
        setToken(""); 
        localStorage.removeItem('token');
        toast.success("Logged out successfully");
        navigate('/');
    };

    /**
     * Dynamic class generation for NavLinks with active state styling.
     *
     */
    const linkClasses = ({ isActive }) => {
        const base = "relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group overflow-hidden";
        const active = "bg-purple-600/10 text-purple-600 shadow-[inset_0_0_0_1px_rgba(147,51,234,0.2)] font-bold";
        const normal = "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50";
        return `${base} ${isActive ? active : normal}`;
    };

    return (
        <motion.div 
            animate={{ width: isCollapsed ? 80 : 256 }}
            className="fixed top-0 left-0 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl z-50 border-r border-slate-200 dark:border-slate-800 flex flex-col"
        >
            {/* Collapse Toggle Button with Micro-interactions */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 size-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-60"
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className="flex h-full flex-col p-4">
                
                {/* Branding Section with Framer Motion AnimatePresence */}
                <div className={`flex items-center gap-3 mt-5 mb-5 px-2 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
                    <img src={assets.sist} className="w-98 h-10 object-contain" alt="ISTE Logo" />
                    {/* <AnimatePresence>
                        {!isCollapsed && (
                            <motion.h2 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-slate-800 dark:text-white font-russo text-xl tracking-tight whitespace-nowrap"
                            >
                                ISTE SIST
                            </motion.h2>
                        )}
                    </AnimatePresence> */}
                </div>

                {/* Glassmorphism Profile Section */}
                <div className={`flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="relative">
                        <img 
                            src={assets.iste_logo} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm" 
                            alt="Admin Profile" 
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div 
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex flex-col overflow-hidden"
                            >
                                <h1 className="text-slate-800 dark:text-slate-100 text-sm font-bold truncate">ISTE Admin</h1>
                                <div className="flex items-center gap-1">
                                    <ShieldCheck size={10} className="text-purple-600" />
                                    <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest">Super Admin</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Menu with Active Indicators */}
                <div className="flex flex-col gap-1.5 mt-8 grow overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path} end={item.end} className={linkClasses}>
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-purple-600' : ''}`} />
                                    {!isCollapsed && <span className="text-sm font-semibold tracking-tight">{item.label}</span>}
                                    
                                    {/* Sidebar Active Indicator Pill */}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="active-pill"
                                            className="absolute left-0 w-1 h-6 bg-purple-600 rounded-r-full"
                                        />
                                    )}

                                    {/* Animated Tooltip for Collapsed State */}
                                    {isCollapsed && (
                                        <div className="absolute left-16 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-2.5 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-xl z-100">
                                            {item.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Footer Section with Settings and Fixed Logout */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                    <button
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <Settings className="w-5 h-5" />
                        {!isCollapsed && <span className="text-sm font-semibold">Settings</span>}
                    </button>
                    
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
                        {isCollapsed && (
                            <div className="absolute left-16 bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-2.5 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-100">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminSidebar;