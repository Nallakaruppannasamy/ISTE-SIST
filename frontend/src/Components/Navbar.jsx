import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { assets } from '../assets/assets';

const Navbar = ({ darkMode, toggleTheme }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    
    // Check if current route is Home
    const isHomePage = location.pathname === "/";

    // 1. Reading Progress Bar Logic
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Handle scroll state for navbar shrinking and glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'HOME', path: '/' },
        { name: 'TEAM', path: '/team' },
        { name: 'EVENTS', path: '/events' },
        { name: 'GALLERY', path: '/gallery' },
        { name: 'FEEDBACK', path: '/feedback' },
    ];

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${
                // 3. Enhanced Glassmorphism
                isScrolled
                    ? 'py-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-slate-800/50'
                    : 'py-6 bg-transparent'
            }`}
        >
            {/* 1. Reading Progress Bar (Animated) */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 origin-left"
                style={{ scaleX }}
            />

            <div className="container mx-auto px-6 flex justify-between items-center">
                
                {/* 6. Conditional Page Logic for Logo */}
                <Link to="/">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        {isHomePage ? (
                            // Show SIST image only on Home page
                            <motion.img
                                src={assets.sist}
                                alt="SIST"
                                // 4. Logo Size Transition
                                className={`rounded-lg transition-all duration-500 ${
                                    isScrolled ? 'h-20 w-60' : 'h-20 w-60'
                                }`}
                            />
                        ) : (
                            // Show ISTE logo + Text on other pages
                            <>
                                <motion.img
                                    src={assets.iste_logo}
                                    alt="ISTE"
                                    // 4. Logo Size Transition & 5. Glow Effect (on image)
                                    className={`transition-all duration-500 ${
                                        isScrolled ? 'h-10' : 'h-14'
                                    } ${darkMode ? 'drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]' : 'drop-shadow-sm'}`}
                                />
                                <span className={`font-russo text-xl text-purple-600 hidden sm:block transition-all duration-500 ${
                                    // 5. Glow Effect (on text)
                                    darkMode ? 'drop-shadow-[0_0_10px_rgba(147,51,234,0.6)]' : ''
                                }`}>
                                    ISTE SIST
                                </span>
                            </>
                        )}
                    </motion.div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <div key={link.name} className="relative py-2">
                            {/* 2. Active Link Indicator using NavLink */}
                            <NavLink
                                to={link.path}
                                className={({ isActive }) => 
                                    `relative font-ubuntu text-sm font-medium tracking-widest transition-all duration-300 ${
                                        isActive 
                                        ? 'text-purple-600' 
                                        : 'text-slate-700 dark:text-slate-200 hover:text-purple-500'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {link.name}
                                        {/* Underline Indicator Animation */}
                                        <motion.div
                                            className={`absolute -bottom-1 left-0 h-0.5 bg-purple-600 rounded-full`}
                                            initial={false}
                                            animate={{ width: isActive ? "100%" : "0%" }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </>
                                )}
                            </NavLink>
                        </div>
                    ))}

                    {/* Theme Toggle Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-yellow-400 shadow-inner transition-all hover:shadow-purple-500/20"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>
                </div>

                {/* Mobile Toggle Icons */}
                <div className="md:hidden flex items-center gap-4">
                    <button onClick={toggleTheme} className="dark:text-yellow-400 transition-transform active:scale-90">
                        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="dark:text-white">
                        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t dark:border-slate-800 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => 
                                        `font-ubuntu text-lg transition-colors ${
                                            isActive ? 'text-purple-600 font-bold underline decoration-2 underline-offset-8' : 'dark:text-white'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;