import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Clock, FileText, Download, X, Search, Rocket, ChevronRight, ExternalLink, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- UTILITY: Date Formatting Helper ---
const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);
    
    const day = date.getDate();
    const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                   (day % 10 === 2 && day !== 12) ? 'nd' :
                   (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    
    return formatted.replace(day, day + suffix);
};

// --- UTILITY: Ensure External Redirection ---
const ensureExternalLink = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `https://${url}`;
};

// --- COMPONENT: Skeleton Loading Card ---
const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 h-64 animate-pulse border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
        <div className="flex justify-between">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="space-y-3">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
    </div>
);

// --- COMPONENT: Section Divider (SVG Wave) ---
const SectionDivider = () => (
    <div className="w-full overflow-hidden leading-none my-16">
        <svg className="relative block w-full h-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-purple-600/5 dark:fill-purple-600/10"></path>
        </svg>
    </div>
);

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("All");
    const [selectedEvent, setSelectedEvent] = useState(null); 
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/list-events`);
            console.log("Full Event Data from Backend:", data.events); // DEBUG LOG
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    // Filter Logic
    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const eventYear = new Date(e.date).getFullYear().toString();
        const matchesYear = (selectedYear === "All" || eventYear === selectedYear);
        return matchesSearch && matchesYear;
    });

    // Splitting Logic - Using .trim() and .toLowerCase() for safety
    const upcoming = filteredEvents.filter(e => e.category?.toLowerCase().trim() === 'upcoming');
    const finished = filteredEvents.filter(e => e.category?.toLowerCase().trim() === 'finished');

    // Extract Years for Filter
    const years = ["All", ...new Set(events.filter(e => e.category?.toLowerCase() === 'finished').map(e => new Date(e.date).getFullYear().toString()))].sort().reverse();

    const EventCard = ({ item }) => {
        const eventDate = new Date(item.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleString('en-US', { month: 'short' });

        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-4xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-6 group hover:border-purple-500 transition-all duration-300 relative"
            >
                {/* --- DATE-CARD LAYOUT --- */}
                <div className="flex flex-row sm:flex-col items-center justify-center bg-purple-600 text-white rounded-3xl min-w-21.25 h-fit sm:h-25 p-3 sm:p-0 shadow-lg shadow-purple-200 dark:shadow-none">
                    <span className="text-3xl font-russo">{day}</span>
                    <span className="text-xs font-bold uppercase tracking-widest ml-2 sm:ml-0">{month}</span>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        {/* --- ENHANCED CATEGORY BADGES --- */}
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-tighter ${item.category?.toLowerCase() === 'upcoming' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {item.category}
                        </span>
                        <div className="flex gap-2">
                            {/* Card Level Registration Redirection */}
                            {item.category?.toLowerCase() === 'upcoming' && item.registrationLink && (
                                <a 
                                    href={ensureExternalLink(item.registrationLink)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                    title="Register Now"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            )}
                            <a href={item.brochure} target="_blank" rel="noreferrer" title="View Brochure" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-400 hover:text-purple-600 transition-colors">
                                <FileText size={18} />
                            </a>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{item.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4">{item.description}</p>

                    <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t dark:border-slate-700 pt-4">
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-purple-600"/> {item.time}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-purple-600"/> {item.venue}</span>
                    </div>

                    <button 
                        onClick={() => setSelectedEvent(item)}
                        className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all w-fit group/btn"
                    >
                        Learn More <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 relative overflow-hidden">
            {/* --- BACKGROUND FLOURISHES --- */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#9333ea 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="container mx-auto relative z-10">
                {/* Header & Search/Filters */}
                <div className="text-center mb-16">
                    <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl md:text-6xl font-russo dark:text-white mb-4">
                        ISTE <span className="text-purple-600">Events</span>
                    </motion.h1>
                    <div className="w-24 h-1.5 bg-purple-600 mx-auto rounded-full mb-12"></div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by name..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-3xl border dark:border-slate-800 dark:bg-slate-800 dark:text-white shadow-lg outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                            />
                        </div>
                        <div className="relative w-full md:w-56">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-3xl border dark:border-slate-800 dark:bg-slate-800 dark:text-white shadow-lg outline-none appearance-none cursor-pointer font-bold text-xs uppercase"
                            >
                                <option value="All">All Years</option>
                                {years.filter(y => y !== "All").map(yr => <option key={yr} value={yr}>{yr}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <>
                        {/* Upcoming Section */}
                        <div className="mb-20">
                            <h2 className="text-3xl font-russo dark:text-white mb-10 flex items-center gap-4">
                                <span className="w-8 h-1 bg-green-500 rounded-full"></span> Upcoming Events
                            </h2>
                            {upcoming.length === 0 ? (
                                /* --- EMPTY STATE UI --- */
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center">
                                    <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-purple-600 mb-6">
                                        <Rocket size={80} />
                                    </motion.div>
                                    <h3 className="text-2xl font-russo dark:text-white mb-2">Stay Tuned!</h3>
                                    <p className="text-slate-500 dark:text-slate-400">We are currently cooking up something amazing for you.</p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {upcoming.map(item => <EventCard key={item._id} item={item} />)}
                                </div>
                            )}
                        </div>

                        <SectionDivider />

                        {/* Past Section */}
                        <div className="mb-20">
                            <h2 className="text-3xl font-russo dark:text-white mb-10 flex items-center gap-4">
                                <span className="w-8 h-1 bg-slate-400 rounded-full"></span> Past Highlights
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {finished.map(item => <EventCard key={item._id} item={item} />)}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- DETAILED EVENT MODAL --- */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border dark:border-slate-800">
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                <X size={24} />
                            </button>

                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
                                <div className="bg-purple-600 text-white p-6 rounded-3xl shadow-xl shadow-purple-200 dark:shadow-none">
                                    <FileText size={40} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-russo dark:text-white mb-1">{selectedEvent.title}</h2>
                                    <p className="text-purple-600 font-bold uppercase tracking-widest text-xs">{selectedEvent.category} Event</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-slate-800">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Event Logistics</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4">
                                        <div className="flex items-center gap-3 text-sm dark:text-white"><Calendar size={18} className="text-purple-600"/> {formatEventDate(selectedEvent.date)}</div>
                                        <div className="flex items-center gap-3 text-sm dark:text-white"><Clock size={18} className="text-purple-600"/> {selectedEvent.time}</div>
                                        <div className="flex items-center gap-3 text-sm dark:text-white"><MapPin size={18} className="text-purple-600"/> {selectedEvent.venue}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">About the Event</h4>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-ubuntu whitespace-pre-wrap">
                                        {selectedEvent.longDescription}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* --- BROCHURE PREVIEW LINK --- */}
                                    <a href={selectedEvent.brochure} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold hover:bg-slate-200 transition-all">
                                        <Download size={20}/> Download Brochure
                                    </a>
                                    {/* --- REGISTRATION LINK --- */}
                                    {selectedEvent.category?.toLowerCase().trim() === 'upcoming' && selectedEvent.registrationLink && (
                                        <a href={ensureExternalLink(selectedEvent.registrationLink)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 shadow-xl shadow-purple-500/20 dark:shadow-none transition-all">
                                            Register Now <ExternalLink size={20}/>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Events;