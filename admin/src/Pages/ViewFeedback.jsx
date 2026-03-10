import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    Star, Trash2, Calendar, Search, Download, Printer, 
    Inbox, CheckSquare, Square, CheckCircle2, XCircle, 
    AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'react-toastify';

const ViewFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterEvent, setFilterEvent] = useState("All");
    const [filterRating, setFilterRating] = useState("All");
    const [showConfirm, setShowConfirm] = useState({ show: false, id: null });

    const token = localStorage.getItem('token');
    // Using environment variable with a fallback to your local backend
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

    // Feature 20: Memoized Calculations for Performance
    const { filteredData, stats, eventList } = useMemo(() => {
        let data = [...feedbacks];

        // Feature 1: Search Logic
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(f => 
                f.name.toLowerCase().includes(query) || 
                f.rollNumber.toLowerCase().includes(query) || 
                f.message.toLowerCase().includes(query)
            );
        }

        // Feature 2 & 3: Filtering Logic
        if (filterEvent !== "All") data = data.filter(f => f.eventName === filterEvent);
        if (filterRating !== "All") data = data.filter(f => f.rating === parseInt(filterRating));

        // Feature 11: Rating Distribution Calculations
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

        return { filteredData: data, stats: { avg, distribution, total: feedbacks.length }, eventList: events };
    }, [feedbacks, searchQuery, filterEvent, filterRating]);

    // Feature 6: CSV Export
    const exportCSV = () => {
        const headers = "Name,Roll Number,Event,Rating,Message,Date\n";
        const rows = feedbacks.map(f => 
            `"${f.name}","${f.rollNumber}","${f.eventName}",${f.rating},"${f.message.replace(/"/g, '""')}","${new Date(f.date).toLocaleDateString()}"`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISTE_Feedback_Report_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    // Feature 21: Optimistic UI Delete
    const handleDelete = async (id) => {
        const originalData = [...feedbacks];
        setFeedbacks(prev => prev.filter(f => f._id !== id));
        setShowConfirm({ show: false, id: null });

        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/remove-feedback`, { id }, { headers: { token } });
            if (data.success) {
                toast.success("Feedback Deleted");
            } else {
                throw new Error();
            }
        } catch (error) {
            setFeedbacks(originalData); // Revert on failure
            toast.error("Delete failed. Reverting...");
        }
    };

    // Feature 7: Mark as Processed (Syncs with updated backend controller)
    const toggleProcessed = async (id) => {
        // Optimistic update
        setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, processed: !f.processed } : f));
        
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/toggle-feedback`, { id }, { headers: { token } });
            if (!data.success) throw new Error();
        } catch (error) {
            // Revert on failure
            setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, processed: !f.processed } : f));
            toast.error("Failed to sync status");
        }
    };

    // Feature 18: Highlight Search Matches
    const highlightText = (text, highlight) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === highlight.toLowerCase() 
                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-white rounded px-0.5">{part}</mark> 
                : part
        );
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Feature 24: Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .card { break-inside: avoid; border: 1px solid #e2e8f0 !important; margin-bottom: 1rem !important; }
                    body { background: white !important; }
                }
            `}} />

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6 no-print">
                <h1 className="text-3xl font-russo dark:text-white flex items-center gap-3">
                    <Inbox className="text-purple-600" /> Feedback Inbox
                </h1>
                <div className="flex flex-wrap gap-3">
                    <button onClick={exportCSV} className="flex items-center gap-2 bg-white dark:bg-slate-900 border dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 dark:text-white transition-all shadow-sm">
                        <Download size={18}/> Export CSV
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md">
                        <Printer size={18}/> Print Report
                    </button>
                </div>
            </div>

            {/* Feature 11: Fixed Rating Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 no-print">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sentiment Overview</p>
                    <div className="flex items-end gap-2 h-32">
                        {stats.distribution.map((count, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden flex-1 min-h-2.5">
                                    <div 
                                        className="absolute bottom-0 w-full bg-yellow-500 transition-all duration-700" 
                                        style={{ height: `${(count / (Math.max(...stats.distribution) || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{i+1}★</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Rating</p>
                    <div className="text-5xl font-russo text-yellow-500 flex items-center gap-2">
                        {stats.avg} <Star fill="currentColor" size={32}/>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
                    <p className="text-5xl font-russo text-purple-600">{stats.total}</p>
                </div>
            </div>

            {/* Feature 1, 2, 3: Search & Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row gap-4 no-print">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Search name, roll number, or message..." 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-purple-600 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select value={filterEvent} onChange={(e)=>setFilterEvent(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm dark:text-white outline-none cursor-pointer">
                        {eventList.map(ev => <option key={ev} value={ev}>{ev === "All" ? "All Events" : ev}</option>)}
                    </select>
                    <select value={filterRating} onChange={(e)=>setFilterRating(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm dark:text-white outline-none cursor-pointer">
                        <option value="All">All Ratings</option>
                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                </div>
            </div>

            {/* Feature 12, 13, 16: Main Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl"></div>)}
                </div>
            ) : filteredData.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed dark:border-slate-800">
                    <Inbox size={48} className="mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold dark:text-white">No feedback matches your criteria</h2>
                    <button onClick={() => {setSearchQuery(""); setFilterEvent("All"); setFilterRating("All");}} className="mt-4 text-purple-600 font-bold">Clear Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredData.map((item) => (
                        <div key={item._id} className={`card bg-white dark:bg-slate-900 rounded-3xl border p-6 transition-all ${item.processed ? 'border-green-100 dark:border-green-900/20 opacity-75 shadow-none' : 'dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${item.processed ? 'bg-slate-400' : 'bg-purple-600'}`}>
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold dark:text-white text-sm line-clamp-1">{highlightText(item.name, searchQuery)}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold">{highlightText(item.rollNumber, searchQuery)}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{highlightText(item.email, searchQuery)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 no-print">
                                    <button 
                                        onClick={() => toggleProcessed(item._id)} 
                                        className={`p-1.5 rounded-lg transition-colors ${item.processed ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-slate-300 hover:text-purple-600'}`} 
                                        title={item.processed ? "Mark as Unread" : "Mark as Addressed"}
                                    >
                                        {item.processed ? <CheckSquare size={18}/> : <Square size={18}/>}
                                    </button>
                                    <button 
                                        onClick={() => setShowConfirm({show: true, id: item._id})} 
                                        className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                        title="Delete Feedback"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded uppercase tracking-wider">{item.eventName}</span>
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= item.rating ? "#eab308" : "none"} className={s <= item.rating ? "text-yellow-500" : "text-slate-300"} />)}
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic line-clamp-4">"{highlightText(item.message, searchQuery)}"</p>
                            <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Calendar size={12}/> {new Date(item.date).toLocaleDateString()}
                                </div>
                                <div>
                                    {item.consent ? (
                                        <span className="text-[9px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle2 size={10}/> Can Contact
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full flex items-center gap-1">
                                            <XCircle size={10}/> No Contact
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Feature 14: Custom Delete Modal */}
            {showConfirm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-4"><AlertCircle size={24} /></div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">Permanently delete?</h3>
                        <p className="text-slate-500 text-sm mb-6">This submission will be removed from the database and cannot be recovered.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm({show: false, id: null})} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold dark:text-white hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(showConfirm.id)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-md">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewFeedback;