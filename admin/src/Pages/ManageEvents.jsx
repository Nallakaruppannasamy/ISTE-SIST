import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CalendarDays, 
    Plus, 
    Trash2, 
    MapPin, 
    Upload, 
    Clock, 
    Edit3, 
    FileText, 
    Link as LinkIcon, 
    FileUp 
} from 'lucide-react';
import { toast } from 'react-toastify';

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [venue, setVenue] = useState('');
    const [category, setCategory] = useState('upcoming');
    const [registrationLink, setRegistrationLink] = useState('');
    const [brochure, setBrochure] = useState(false);

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    // Fetch all events
    const fetchEvents = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/list-events`);
            if (data.success) {
                // Sort events: Upcoming first, then Finished
                const sorted = data.events.sort((a, b) => {
                    if (a.category === 'upcoming' && b.category === 'finished') return -1;
                    if (a.category === 'finished' && b.category === 'upcoming') return 1;
                    return new Date(b.date) - new Date(a.date);
                });
                setEvents(sorted);
            }
        } catch (error) {
            toast.error("Error fetching events");
        }
    };

    const resetForm = () => {
        setTitle(''); 
        setDescription(''); 
        setLongDescription('');
        setDate(''); 
        setTime(''); 
        setVenue(''); 
        setCategory('upcoming');
        setRegistrationLink(''); 
        setBrochure(false); 
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (event) => {
        setEditId(event._id);
        setTitle(event.title);
        setDescription(event.description);
        setLongDescription(event.longDescription);
        // Format date for the input field (YYYY-MM-DD)
        setDate(new Date(event.date).toISOString().split('T')[0]);
        setTime(event.time);
        setVenue(event.venue);
        setCategory(event.category);
        setRegistrationLink(event.registrationLink || '');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            if (editId) formData.append('id', editId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('longDescription', longDescription);
            formData.append('date', date);
            formData.append('time', time);
            formData.append('venue', venue);
            formData.append('category', category);
            formData.append('registrationLink', registrationLink);
            if (brochure) formData.append('brochure', brochure);

            const url = editId ? `${backendUrl}/api/admin/update-event` : `${backendUrl}/api/admin/add-event`;
            const { data } = await axios.post(url, formData, { headers: { token } });

            if (data.success) {
                toast.success(data.message);
                resetForm();
                fetchEvents();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Process failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeEvent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/remove-event`, { id }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                fetchEvents();
            }
        } catch (error) {
            toast.error("Error removing event");
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    // Check if the event being edited is already finished to lock the category
    const isCategoryLocked = editId && events.find(ev => ev._id === editId)?.category === 'finished';

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-200 dark:shadow-none">
                        <CalendarDays size={28} />
                    </div>
                    <h1 className="text-3xl font-russo dark:text-white">Manage Events</h1>
                </div>
                <button 
                    onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} 
                    className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none"
                >
                    {showForm ? 'Close' : <><Plus size={20} /> Add New Event</>}
                </button>
            </div>

            {/* Event Form */}
            {showForm && (
                <form onSubmit={onSubmitHandler} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 mb-12 max-w-5xl shadow-xl mx-auto">
                    <h2 className="text-xl font-russo dark:text-white mb-6 border-b dark:border-slate-800 pb-4">
                        {editId ? 'Edit Event Details' : 'Create New Event'}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Brochure Upload */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Event Brochure (Image or PDF)</label>
                            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50 dark:bg-slate-800/50">
                                <label htmlFor="brochure-upload" className="cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 flex items-center gap-2 transition-all">
                                    <FileUp size={18} /> {editId ? 'Change Brochure' : 'Upload Brochure'}
                                </label>
                                <input onChange={(e) => setBrochure(e.target.files[0])} type="file" id="brochure-upload" hidden required={!editId} />
                                <span className="text-sm text-slate-500 font-medium">
                                    {brochure ? brochure.name : (editId ? 'Brochure already exists' : 'No file selected')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Event Title</label>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Enter title" className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Venue / Location</label>
                                <input value={venue} onChange={(e) => setVenue(e.target.value)} type="text" placeholder="Enter venue" className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Date</label>
                                    <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Time</label>
                                    <input value={time} onChange={(e) => setTime(e.target.value)} type="text" placeholder="e.g. 10:00 AM" className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600" required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Registration Link (Optional)</label>
                                <input value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} type="url" placeholder="https://forms.gle/..." className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Category</label>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)} 
                                    className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                                    disabled={isCategoryLocked}
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="finished">Finished</option>
                                </select>
                                {isCategoryLocked && <p className="text-[10px] text-red-500 mt-1 ml-2">* Finished events cannot be moved back to Upcoming</p>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Short Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter brief summary" className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600" rows="1" required />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Long Detailed Description</label>
                            <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} placeholder="Enter full event details, agenda, etc." className="p-4 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 transition-all" rows="4" required />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button type="button" onClick={resetForm} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white p-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                            Cancel
                        </button>
                        <button disabled={loading} type="submit" className="flex-2 bg-purple-600 text-white p-4 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none">
                            {loading ? 'Processing...' : editId ? 'Update Event Info' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            )}

            {/* Events List */}
            <h2 className="text-xl font-russo dark:text-white mb-6">Live Events Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                    <div key={event._id} className="bg-white dark:bg-slate-900 rounded-4xl border dark:border-slate-800 p-6 shadow-sm group hover:shadow-xl hover:border-purple-500/30 transition-all relative overflow-hidden">
                        {/* Status Bar */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${event.category === 'upcoming' ? 'bg-green-500' : 'bg-slate-500'}`} />
                        
                        <div className="flex justify-between items-start mb-6 pt-2">
                            <div className="bg-purple-600/10 p-4 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                <FileText size={28} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(event)} className="p-2 bg-slate-50 dark:bg-slate-800 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white shadow-sm transition-all">
                                    <Edit3 size={18} />
                                </button>
                                <button onClick={() => removeEvent(event._id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white shadow-sm transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-xl dark:text-white mb-2 line-clamp-1">{event.title}</h3>
                        
                        <div className="space-y-2 mb-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <p className="flex items-center gap-2"><CalendarDays size={14} className="text-purple-600"/> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                            <p className="flex items-center gap-2"><MapPin size={14} className="text-purple-600"/> {event.venue}</p>
                            <p className="flex items-center gap-2"><Clock size={14} className="text-purple-600"/> {event.time}</p>
                            {event.registrationLink && (
                                <p className="flex items-center gap-2 text-purple-600 font-bold">
                                    <LinkIcon size={14}/> Registration Active
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-slate-800">
                            <div className={`text-[10px] font-bold uppercase py-1 px-4 rounded-full ${event.category === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                {event.category}
                            </div>
                            <a href={event.brochure} target="_blank" rel="noreferrer" className="text-xs font-bold text-purple-600 hover:underline">
                                View Brochure
                            </a>
                        </div>
                    </div>
                ))}
            </div>
            
            {events.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed dark:border-slate-800">
                    <p className="text-slate-400 font-medium italic">No events found. Start by adding one!</p>
                </div>
            )}
        </div>
    );
};

export default ManageEvents;