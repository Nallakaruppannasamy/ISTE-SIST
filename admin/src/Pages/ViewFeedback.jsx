import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Star, Trash2, Calendar, Search, Download, 
    Inbox, CheckSquare, Square, CheckCircle2, XCircle, 
    AlertCircle, Loader2, ArrowUpDown, Clock, Filter, 
    X, Mail, RefreshCw, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const ViewFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterEvent, setFilterEvent] = useState("All");
    const [filterRating, setFilterRating] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All"); // All, Pending, Addressed
    const [filterTime, setFilterTime] = useState("All"); // All, Today, Week, Month
    const [sortBy, setSortBy] = useState("newest"); // newest, oldest, highest, lowest
    const [showConfirm, setShowConfirm] = useState({ show: false, id: null });
    const [expandedMessages, setExpandedMessages] = useState({});
    const [copiedId, setCopiedId] = useState(null);

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/list-feedback`, { headers: { token } });
            if (data.success) {
                setFeedbacks(data.feedbacks);
            }
        } catch (error) {
            toast.error("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFeedback(); }, []);

    // Memoized Filters, Sorters, Metrics, and Trends Calculations
    const { filteredData, stats, eventList, trends } = useMemo(() => {
        let data = [...feedbacks];

        // 1. Read vs Unread Status Filters
        if (filterStatus === "Pending") data = data.filter(f => !f.processed);
        if (filterStatus === "Addressed") data = data.filter(f => f.processed);

        // 2. Interactive Sentiment Chart Bar Filters
        if (filterRating !== "All") data = data.filter(f => f.rating === parseInt(filterRating));

        // 3. Event Filter
        if (filterEvent !== "All") data = data.filter(f => f.eventName === filterEvent);

        // 4. Date Range Picker Filter Logic
        const now = new Date();
        if (filterTime === "Today") {
            data = data.filter(f => new Date(f.date).toDateString() === now.toDateString());
        } else if (filterTime === "Week") {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            data = data.filter(f => new Date(f.date) >= sevenDaysAgo);
        } else if (filterTime === "Month") {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            data = data.filter(f => new Date(f.date) >= thirtyDaysAgo);
        }

        // 5. Search Filtering Logic
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(f => 
                f.name.toLowerCase().includes(query) || 
                f.rollNumber.toLowerCase().includes(query) || 
                f.message.toLowerCase().includes(query)
            );
        }

        // 6. Sort Order Toggles
        data.sort((a, b) => {
            if (sortBy === "newest") return new Date(b.date) - new Date(a.date);
            if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
            if (sortBy === "highest") return b.rating - a.rating;
            if (sortBy === "lowest") return a.rating - b.rating;
            return 0;
        });

        // 7. Structural Chart Distribution metrics
        const distribution = [0, 0, 0, 0, 0];
        feedbacks.forEach(f => {
            if (f.rating >= 1 && f.rating <= 5) {
                distribution[f.rating - 1]++;
            }
        });
        
        const avg = feedbacks.length > 0 
            ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.length).toFixed(1) 
            : 0;

        const events = ["All", ...new Set(feedbacks.map(f => f.eventName))];

        // 8. Dynamic Metric Trend Badge Calculations (Last 24 Hours)
        const todayStart = new Date(now.setHours(0,0,0,0)).getTime();
        const dailyNewCount = feedbacks.filter(f => new Date(f.date).getTime() >= todayStart).length;
        const dailyNewPending = feedbacks.filter(f => !f.processed && new Date(f.date).getTime() >= todayStart).length;

        return { 
            filteredData: data, 
            stats: { avg, distribution, total: feedbacks.length }, 
            eventList: events,
            trends: { dailyNewCount, dailyNewPending }
        };
    }, [feedbacks, searchQuery, filterEvent, filterRating, filterStatus, filterTime, sortBy]);

    // CSV Export targeting currently filtered custom rows matching specifications
    const exportCSV = () => {
        const headers = "Name,Roll Number,Event,Rating,Message,Date\n";
        const rows = filteredData.map(f => 
            `"${f.name}","${f.rollNumber}","${f.eventName}",${f.rating},"${f.message.replace(/"/g, '""')}","${new Date(f.date).toLocaleDateString()}"`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISTE_Feedback_Report_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    // Toast Undo Action Handling for Destructive Actions
    const handleDeleteRequest = (id) => {
        let isUndone = false;

        const toastId = toast.info(
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold">Feedback deletion pending...</span>
                <button 
                    onClick={() => { isUndone = true; toast.dismiss(toastId); }} 
                    className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-md transition-all shadow-sm"
                >
                    Undo
                </button>
            </div>,
            { autoClose: 4000, closeOnClick: false, draggable: false }
        );

        setTimeout(() => {
            if (!isUndone) {
                commitDelete(id);
            } else {
                toast.success("Action undone successfully");
            }
        }, 4100);
    };

    const commitDelete = async (id) => {
        const originalData = [...feedbacks];
        setFeedbacks(prev => prev.filter(f => f._id !== id));
        setShowConfirm({ show: false, id: null });

        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/remove-feedback`, { id }, { headers: { token } });
            if (data.success) {
                toast.success("Feedback Permanently Deleted");
            } else {
                throw new Error();
            }
        } catch (error) {
            setFeedbacks(originalData);
            toast.error("Deletion failed server synchronization");
        }
    };

    const toggleProcessed = async (id) => {
        setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, processed: !f.processed } : f));
        
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/toggle-feedback`, { id }, { headers: { token } });
            if (!data.success) throw new Error();
        } catch (error) {
            setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, processed: !f.processed } : f));
            toast.error("Failed to sync structural process status");
        }
    };

    const toggleMessageExpand = (id) => {
        setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCopyRollNumber = (id, roll) => {
        navigator.clipboard.writeText(roll);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast.success("Roll number copied to clipboard", { autoClose: 1500 });
    };

    const clearAllFilters = () => {
        setSearchQuery("");
        setFilterEvent("All");
        setFilterRating("All");
        setFilterStatus("All");
        setFilterTime("All");
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === highlight.toLowerCase() 
                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-white rounded px-0.5">{part}</mark> 
                : part
        );
    };

    // Sentiment Color Strip calculation mapping
    const getSentimentColorStrip = (rating) => {
        if (rating >= 4) return 'bg-emerald-500 dark:bg-emerald-600';
        if (rating === 3) return 'bg-amber-500 dark:bg-amber-600';
        return 'bg-rose-500 dark:bg-rose-600';
    };

    // Student Avatars unique deterministic color profile generation
    const getAvatarGradient = (rollNumber) => {
        const charSum = rollNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const dynamicGradients = [
            'from-purple-500 to-indigo-600',
            'from-emerald-500 to-teal-600',
            'from-blue-500 to-cyan-600',
            'from-rose-500 to-pink-600',
            'from-amber-500 to-orange-600'
        ];
        return dynamicGradients[charSum % dynamicGradients.length];
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            
            {/* Global Keyframe CSS Injection for CSS Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}} />

            {/* Application Main Topbar Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-russo dark:text-white flex items-center gap-3">
                        <Inbox className="text-purple-600" /> Feedback Management
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Review student observations, filter event targets, and compile records.</p>
                </div>
                <button onClick={exportCSV} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95">
                    <Download size={18}/> Export Filtered CSV
                </button>
            </div>

            {/* Metrics and Dynamic Trend Indicators Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Rating</p>
                        <div className="text-4xl font-russo text-yellow-500 flex items-center gap-2 mt-1">
                            {stats.avg} <Star fill="currentColor" size={26}/>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Clock size={12} /> Live telemetry stream active
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
                        <p className="text-4xl font-russo text-purple-600 dark:text-purple-400 mt-1">{stats.total}</p>
                    </div>
                    {/* Dynamic Metric Trend Indicators */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {trends.dailyNewCount > 0 ? (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                +{trends.dailyNewCount} New Today
                            </span>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                Stable Metrics
                            </span>
                        )}
                        {trends.dailyNewPending > 0 && (
                            <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                {trends.dailyNewPending} Awaiting Action
                            </span>
                        )}
                    </div>
                </div>

                {/* Interactive Sentiment Chart Bars Block */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interactive Sentiment Breakdown</p>
                        {filterRating !== "All" && (
                            <button onClick={() => setFilterRating("All")} className="text-[10px] font-bold text-purple-600 hover:underline dark:text-purple-400">
                                Reset Bar Target
                            </button>
                        )}
                    </div>
                    <div className="flex items-end gap-3 h-16 mt-2">
                        {stats.distribution.map((count, i) => {
                            const isBarSelected = filterRating === "All" || parseInt(filterRating) === (i + 1);
                            return (
                                <div 
                                    key={i} 
                                    onClick={() => setFilterRating(filterRating === String(i + 1) ? "All" : String(i + 1))}
                                    className={`flex-1 flex flex-col items-center gap-1 h-full justify-end cursor-pointer group transition-all`}
                                    title={`Click to filter down to ${i + 1} Star submissions`}
                                >
                                    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-md relative overflow-hidden h-12 transition-all group-hover:scale-x-105 ${!isBarSelected ? 'opacity-30' : 'opacity-100'}`}>
                                        <div 
                                            className={`absolute bottom-0 w-full transition-all duration-700 rounded-t-sm ${
                                                i + 1 >= 4 ? 'bg-emerald-500' : i + 1 === 3 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} 
                                            style={{ height: `${(count / (Math.max(...stats.distribution) || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-[9px] font-extrabold transition-colors ${!isBarSelected ? 'text-slate-300' : 'text-slate-400 group-hover:text-purple-600'}`}>
                                        {i+1}★ ({count})
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Read vs Unread Filter Modes Navigation Row */}
            <div className="flex gap-2 mb-4 border-b dark:border-slate-800/80 pb-2">
                {["All", "Pending", "Addressed"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 text-xs font-bold transition-all relative rounded-t-xl ${
                            filterStatus === status 
                            ? 'text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-900 border-t border-x dark:border-slate-800' 
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                    >
                        {status === "All" ? "Complete Feed" : status === "Pending" ? "Unread Box" : "Addressed Archive"}
                        {status === "Pending" && feedbacks.filter(f => !f.processed).length > 0 && (
                            <span className="ml-2 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                                {feedbacks.filter(f => !f.processed).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search Controls, Sorters, and Date Options Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm mb-6 flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
                    
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Filter records via text strings, metrics, identities..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-purple-600 dark:text-white text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        {/* Date Range Picker Selector */}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl">
                            <Calendar size={13} className="text-slate-400" />
                            <select value={filterTime} onChange={(e)=>setFilterTime(e.target.value)} className="bg-transparent border-none p-0 text-xs font-bold dark:text-white outline-none cursor-pointer">
                                <option value="All">All Timelines</option>
                                <option value="Today">Today Only</option>
                                <option value="Week">Past 7 Days</option>
                                <option value="Month">Past 30 Days</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl">
                            <Filter size={13} className="text-slate-400" />
                            <select value={filterEvent} onChange={(e)=>setFilterEvent(e.target.value)} className="bg-transparent border-none p-0 text-xs font-bold dark:text-white outline-none cursor-pointer max-w-35 truncate">
                                {eventList.map(ev => <option key={ev} value={ev}>{ev === "All" ? "All Events" : ev}</option>)}
                            </select>
                        </div>
                        
                        {/* Sort Order Toggle Option Elements */}
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl">
                            <ArrowUpDown size={13} className="text-slate-400" />
                            <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="bg-transparent border-none p-0 text-xs font-bold dark:text-white outline-none cursor-pointer">
                                <option value="newest">Sort: Newest</option>
                                <option value="oldest">Sort: Oldest</option>
                                <option value="highest">Sort: Top Rating</option>
                                <option value="lowest">Sort: Low Rating</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Clear Filters Badge Indicators Panel */}
                {(filterEvent !== "All" || filterRating !== "All" || filterStatus !== "All" || filterTime !== "All" || searchQuery) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t dark:border-slate-800/60">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mr-1">Active Criteria:</span>
                        {filterStatus !== "All" && (
                            <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                Status: {filterStatus} <X size={12} className="cursor-pointer" onClick={() => setFilterStatus("All")} />
                            </span>
                        )}
                        {filterEvent !== "All" && (
                            <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                Event: {filterEvent} <X size={12} className="cursor-pointer" onClick={() => setFilterEvent("All")} />
                            </span>
                        )}
                        {filterRating !== "All" && (
                            <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                Rating: {filterRating}★ <X size={12} className="cursor-pointer" onClick={() => setFilterRating("All")} />
                            </span>
                        )}
                        {filterTime !== "All" && (
                            <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                Timeline: {filterTime} <X size={12} className="cursor-pointer" onClick={() => setFilterTime("All")} />
                            </span>
                        )}
                        {searchQuery && (
                            <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                Query: "{searchQuery}" <X size={12} className="cursor-pointer" onClick={() => setSearchQuery("")} />
                            </span>
                        )}
                        <button onClick={clearAllFilters} className="text-[10px] font-extrabold text-red-500 hover:text-red-600 dark:text-rose-400 transition-colors uppercase tracking-wider ml-auto">
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Skeleton Loading Grids Logic Implementation */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 space-y-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/2" />
                                </div>
                            </div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/4" />
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-5/6" />
                            </div>
                            <div className="pt-4 border-t dark:border-slate-800 flex justify-between">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredData.length === 0 ? (
                /* Empty State Call to Action Layout Design */
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-all shadow-sm">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Inbox size={32} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold dark:text-white">No entries found matching parameters</h2>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">There are no records found matching these active filtering definitions right now.</p>
                    <div className="mt-5 flex items-center justify-center gap-3">
                        <button onClick={clearAllFilters} className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
                            Clear Current Filters
                        </button>
                        <button onClick={fetchFeedback} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition-all">
                            Refresh Feed
                        </button>
                    </div>
                </div>
            ) : (
                /* Smooth Framer Motion Entry Animations Emulated via Native Staggered CSS Animation delays */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredData.map((item, index) => {
                        const isExpanded = !!expandedMessages[item._id];
                        const needsTruncation = item.message.length > 140;
                        const displayedMessage = isExpanded ? item.message : (needsTruncation ? `${item.message.substring(0, 140)}...` : item.message);

                        return (
                            <div 
                                key={item._id} 
                                className={`animate-fade-in-up group relative bg-white dark:bg-slate-900 rounded-3xl border p-6 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
                                    item.processed 
                                    ? 'border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-70' 
                                    : 'dark:border-slate-800 shadow-sm hover:shadow-md border-slate-100'
                                }`}
                                style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                            >
                                {/* Sentiment Color Strip Implementation */}
                                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${getSentimentColorStrip(item.rating)}`} />

                                <div className="flex justify-between items-start mb-4 pl-1">
                                    <div className="flex items-center gap-3">
                                        {/* Student Avatars with Fallbacks Design Configuration */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm transition-all uppercase bg-linear-to-br ${getAvatarGradient(item.rollNumber)}`}>
                                            {item.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold dark:text-white text-sm line-clamp-1">{highlightText(item.name, searchQuery)}</h3>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                <span>{highlightText(item.rollNumber, searchQuery)}</span>
                                                <button 
                                                    onClick={() => handleCopyRollNumber(item._id, item.rollNumber)} 
                                                    className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-600"
                                                    title="Copy ID string"
                                                >
                                                    {copiedId === item._id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button 
                                            onClick={() => toggleProcessed(item._id)} 
                                            className={`p-1.5 rounded-lg transition-colors ${item.processed ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'}`} 
                                            title={item.processed ? "Mark as Pending / Unread" : "Mark as Resolved"}
                                        >
                                            {item.processed ? <CheckSquare size={17}/> : <Square size={17}/>}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteRequest(item._id)} 
                                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                            title="Initiate Deferred Delete Workflow"
                                        >
                                            <Trash2 size={17}/>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-3 pl-1">
                                    <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded uppercase tracking-wider">{item.eventName}</span>
                                    <div className="flex gap-0.5">
                                        {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= item.rating ? "#eab308" : "none"} className={s <= item.rating ? "text-yellow-500" : "text-slate-300"} />)}
                                    </div>
                                    
                                    {/* Feedback Status Badges */}
                                    <div className="ml-auto">
                                        {item.processed ? (
                                            <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                Resolved
                                            </span>
                                        ) : (
                                            <span className="text-[8px] font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                New Ticket
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expandable Text Toggle Functionality Container */}
                                <div className="pl-1 mb-5">
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic transition-all duration-300">
                                        "{highlightText(displayedMessage, searchQuery)}"
                                    </p>
                                    {needsTruncation && (
                                        <button 
                                            onClick={() => toggleMessageExpand(item._id)}
                                            className="mt-1.5 flex items-center gap-1 text-[11px] font-extrabold text-purple-600 dark:text-purple-400 hover:underline"
                                        >
                                            {isExpanded ? (
                                                <>Collapse View <ChevronUp size={12} /></>
                                            ) : (
                                                <>Expand Text <ChevronDown size={12} /></>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800/80 pl-1">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Calendar size={12} className="text-slate-400"/> {new Date(item.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Quick Reply / Email Integration Channel */}
                                        {item.consent && (
                                            <a 
                                                href={`mailto:${item.email}?subject=ISTE SIST Feedback Follow-up (${item.eventName})`}
                                                className="p-1 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 border dark:border-slate-700/60 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center justify-center"
                                                title={`Launch direct follow-up email response to ${item.email}`}
                                            >
                                                <Mail size={13} />
                                            </a>
                                        )}
                                        {item.consent ? (
                                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle2 size={10}/> Callback Ok
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <XCircle size={10}/> Restricted
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewFeedback;