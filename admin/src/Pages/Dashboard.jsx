import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, CalendarDays, Users, TrendingUp, Clock, MapPin, 
    Plus, Image as ImageIcon, MessageSquare, Download, Activity,
    Database, Cloud, Star, CheckCircle2, AlertCircle, ChevronLeft, 
    ChevronRight, ShieldCheck, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const getDashData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, { 
                headers: { token } 
            });
            if (data.success) {
                setDashData(data.dashData);
                setLastSync(new Date().toLocaleTimeString());
            }
        } catch (error) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) getDashData(); }, [token]);

    // Feature 1: Personalized Greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    }, []);

    // Feature 6: Export to CSV
    const downloadCSV = () => {
        const headers = "Title,Venue,Date,Category\n";
        const data = dashData.latestEvents.map(e => `"${e.title}","${e.venue}","${e.date}","${e.category}"`).join("\n");
        const blob = new Blob([headers + data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ISTE_Event_Log.csv'; a.click();
    };

    // Feature 17: Pagination for Event Table
    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return dashData?.latestEvents?.slice(start, start + itemsPerPage) || [];
    }, [dashData, currentPage]);

    // Feature 2: Simple Skeleton Loader
    if (loading) return (
        <div className="p-8 space-y-6">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>)}
            </div>
            <div className="h-96 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse"></div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            
            {/* Top Bar: Greeting & System Status (Feature 19, 21) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-russo text-slate-900 dark:text-white">{greeting}, Admin</h1>
                    <p className="text-sm text-slate-500">System Sync: {lastSync} • Local Server: Online</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    <div className="flex items-center gap-1.5"><Database size={14} className="text-emerald-500"/> DB Active</div>
                    <div className="flex items-center gap-1.5"><Cloud size={14} className="text-blue-500"/> Cloudinary Connected</div>
                </div>
            </div>

            {/* Quick Actions Bar (Feature 3) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/admin/events')} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-600 transition-colors">
                    <Plus size={20} className="text-purple-600"/>
                    <span className="text-sm font-semibold dark:text-white">New Event</span>
                </button>
                <button onClick={() => navigate('/admin/feedback')} className="relative flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-600 transition-colors">
                    <MessageSquare size={20} className="text-emerald-600"/>
                    <span className="text-sm font-semibold dark:text-white">Feedback</span>
                    {dashData?.unreadFeedback > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                            {dashData.unreadFeedback}
                        </span>
                    )}
                </button>
                <button onClick={() => navigate('/admin/teams')} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-600 transition-colors">
                    <UserPlus size={20} className="text-blue-600"/>
                    <span className="text-sm font-semibold dark:text-white">Add Team</span>
                </button>
                <button onClick={downloadCSV} className="flex items-center gap-3 p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                    <Download size={20}/>
                    <span className="text-sm font-semibold">Export Log</span>
                </button>
            </div>

            {/* Simple Stats Grid (Feature 7, 9, 11) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Events</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold dark:text-white">{dashData?.totalEvents}</span>
                        <span className="text-[10px] text-emerald-500 font-bold">{dashData?.upcomingEvents} Upcoming</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Rating</p>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-yellow-500">{dashData.avgRating}</span>
                        <Star size={20} fill="#eab308" className="text-yellow-500"/>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Feedback</p>
                    <span className="text-3xl font-bold dark:text-white">{dashData.totalFeedback}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Team Size</p>
                    <span className="text-3xl font-bold dark:text-white">{dashData.totalTeams}</span>
                </div>
            </div>

            {/* Tables Section (Feature 4, 12, 18) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Team Role Distribution Table (Simple Table) */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-fit">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-sm font-bold flex items-center gap-2 dark:text-white">
                            <Users size={18} className="text-blue-500"/> Team Roles
                        </h2>
                    </div>
                    <table className="w-full text-xs">
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {Object.entries(dashData.roleDistribution).map(([role, count]) => (
                                <tr key={role} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{role}</td>
                                    <td className="p-4 text-right font-bold dark:text-white">{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Main Activity Log Table (Simple Stripped Table) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-sm font-bold flex items-center gap-2 dark:text-white">
                            <Activity size={18} className="text-purple-600"/> Activity Log
                        </h2>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30"><ChevronLeft size={14}/></button>
                            <button disabled={paginatedEvents.length < itemsPerPage} onClick={() => setCurrentPage(p => p + 1)} className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30"><ChevronRight size={14}/></button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                                    <th className="p-4 px-6">Event</th>
                                    <th className="p-4 px-6">Date</th>
                                    <th className="p-4 px-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold dark:text-white">{event.title}</span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10}/> {event.venue}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 px-6 text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</td>
                                        <td className="p-4 px-6 text-right">
                                            {event.category === 'upcoming' ? (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 uppercase">Upcoming</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 uppercase">Finished</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;