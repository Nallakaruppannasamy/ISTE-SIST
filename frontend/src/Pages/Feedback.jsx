import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Star, Send, User, Mail, Hash, MessageSquare, 
    CheckCircle, Info, Search, Sparkles, AlertCircle, 
    ChevronDown, Smile, BarChart3, Heart
} from 'lucide-react';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const Feedback = () => {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        rollNumber: '', 
        eventName: 'General Feedback', 
        rating: 5, 
        message: '',
        consent: false
    });

    const formRef = useRef(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    // Rating Labels (Feature 1)
    const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Exceptional!"];

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await axios.get(`${backendUrl}/api/admin/list-events`);
            if (data.success) {
                setEvents(data.events.filter(e => e.category === 'finished'));
            }
        };
        fetchEvents();
    }, []);

    // Feature 10: Progress Bar Calculation
    const calculateProgress = () => {
        const fields = [formData.name, formData.email, formData.rollNumber, formData.message];
        const filled = fields.filter(f => f.trim().length > 0).length;
        const consentWeight = formData.consent ? 1 : 0;
        return ((filled + consentWeight) / (fields.length + 1)) * 100;
    };

    // Feature 13: Quick Emoji Append
    const addEmoji = (emoji) => {
        if (formData.message.length < 1500) {
            setFormData({ ...formData, message: formData.message + emoji });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Feature 9: Auto-scroll on Error (Example: message too short)
        if (formData.message.length < 10) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
            return toast.warning("Please provide a more detailed message!");
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/add-feedback`, formData);
            if (data.success) {
                setSubmitted(true);
                // Feature 12: Confetti Celebration
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#9333ea', '#ffffff', '#ff00ff']
                });
                toast.success("Feedback shared successfully!");
            }
        } catch (error) {
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="pt-40 pb-20 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-6">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="text-center max-w-md bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border dark:border-slate-800"
                >
                    {/* Feature 2: Animated Success Icon */}
                    <motion.div 
                        animate={{ y: [0, -10, 0] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle size={50} />
                    </motion.div>
                    <h2 className="text-3xl font-russo dark:text-white mb-4 text-purple-600">Feedback Received!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                        You're the best! We appreciate you taking the time to help us improve ISTE SIST.
                    </p>
                    <button 
                        onClick={() => setSubmitted(false)} 
                        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 dark:shadow-none hover:bg-purple-700 transition-all"
                    >
                        Submit Another Entry
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            {/* Feature 10: Form Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 z-100 bg-slate-200 dark:bg-slate-800">
                <motion.div 
                    className="h-full bg-purple-600" 
                    animate={{ width: `${calculateProgress()}%` }}
                />
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            
            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    
                    {/* Left Side Info: Glassmorphism (Feature 4) */}
                    <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <h1 className="text-5xl md:text-7xl font-russo dark:text-white mb-6">
                            Improve <span className="text-purple-600">Together</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
                            Your feedback is the fuel for our innovation. Whether it's a compliment or a critique, we are listening.
                        </p>
                        
                        <div className="space-y-4">
                            {/* Feature 20: Simple Stats Display */}
                            <div className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600">
                                    <BarChart3 size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white">Current Performance</h4>
                                    <p className="text-xs text-slate-500">Average Event Rating: 4.9/5.0</p>
                                </div>
                            </div>

                            <div className="p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm flex items-center gap-4">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl text-yellow-600">
                                    <Sparkles size={24}/>
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white">Community Trust</h4>
                                    <p className="text-xs text-slate-500">100% of feedback is reviewed manually.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Form Card with Glow (Feature 6) */}
                    <motion.form 
                        ref={formRef}
                        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit}
                        className={`bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-white/20 dark:border-slate-800 transition-all duration-500 ${
                            formData.rating === 5 ? 'shadow-[0_0_50px_rgba(147,51,234,0.2)]' : 'shadow-2xl'
                        }`}
                    >
                        {/* Feature 18: Searchable Custom Dropdown */}
                        <div className="mb-8">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Event Selection</label>
                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white text-left flex justify-between items-center border border-transparent focus:border-purple-600 transition-all"
                                >
                                    <span className="truncate">{formData.eventName}</span>
                                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-2xl p-4 overflow-hidden"
                                        >
                                            <div className="relative mb-3">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                                                <input 
                                                    type="text" placeholder="Filter events..." 
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs outline-none text-white"
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1">
                                                <div 
                                                    onClick={() => { setFormData({...formData, eventName: 'General Feedback'}); setIsDropdownOpen(false); }}
                                                    className="p-3 hover:bg-purple-600 hover:text-white rounded-xl cursor-pointer text-xs dark:text-white transition-colors font-bold"
                                                >
                                                    General Feedback
                                                </div>
                                                {events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map(event => (
                                                    <div 
                                                        key={event._id} 
                                                        onClick={() => { setFormData({...formData, eventName: event.title}); setIsDropdownOpen(false); }}
                                                        className="p-3 hover:bg-purple-600 hover:text-white rounded-xl cursor-pointer text-xs dark:text-white transition-colors"
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input required type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" placeholder="Name" />
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input required type="text" value={formData.rollNumber} onChange={(e)=>setFormData({...formData, rollNumber: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" placeholder="Reg. No" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input required type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" placeholder="Email Address" />
                            </div>
                        </div>

                        {/* Interactive Stars (Feature 5) */}
                        <div className="mb-10 text-center">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Overall Experience</label>
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <motion.button 
                                        key={star} type="button" 
                                        whileHover={{ scale: 1.3, rotate: 15 }}
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setFormData({...formData, rating: star})}
                                        className="transition-colors"
                                    >
                                        <Star size={36} fill={star <= formData.rating ? "#9333ea" : "none"} className={star <= formData.rating ? "text-purple-600" : "text-slate-200 dark:text-slate-700"} />
                                    </motion.button>
                                ))}
                            </div>
                            {/* Dynamic Rating Label (Feature 1) */}
                            <motion.p 
                                key={formData.rating}
                                initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                className="text-purple-600 font-russo mt-4 uppercase text-xs tracking-[0.2em]"
                            >
                                {ratingLabels[formData.rating - 1]}
                            </motion.p>
                        </div>

                        {/* Message Box with Character Counter (Feature 3) */}
                        <div className="mb-6 relative">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 mb-2 block">Your Feedback (Max 1500 chars)</label>
                            <textarea 
                                required maxLength="1500" rows="5" 
                                value={formData.message} onChange={(e)=>setFormData({...formData, message: e.target.value})} 
                                className="w-full p-6 rounded-4xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all resize-none" 
                                placeholder="Tell us more about your experience..." 
                            />
                            {/* Character Counter Display */}
                            <div className={`absolute bottom-4 right-6 text-[10px] font-bold ${formData.message.length >= 1400 ? 'text-red-500' : 'text-slate-400'}`}>
                                {formData.message.length} / 1500
                            </div>

                            {/* Feature 13: Mini Emoji Bar */}
                            <div className="absolute bottom-4 left-6 flex gap-2">
                                {["🔥", "🙌", "⭐", "🚀"].map(emoji => (
                                    <button 
                                        key={emoji} type="button" onClick={() => addEmoji(emoji)}
                                        className="text-lg hover:scale-125 transition-transform"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feature 19: Follow-up Consent */}
                        <div className="flex items-center gap-3 mb-10 ml-2">
                            <input 
                                type="checkbox" id="consent" 
                                className="w-5 h-5 accent-purple-600 cursor-pointer"
                                checked={formData.consent}
                                onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                            />
                            <label htmlFor="consent" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                I'm open to the ISTE team reaching out to discuss this further.
                            </label>
                        </div>

                        <button 
                            disabled={loading} type="submit" 
                            className="w-full py-5 bg-purple-600 text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 dark:shadow-none"
                        >
                            {loading ? "Transmitting..." : <><Send size={20}/> Send Feedback</>}
                        </button>
                    </motion.form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;