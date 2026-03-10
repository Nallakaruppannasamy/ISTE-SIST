import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Trash2, X, Plus, Calendar, FolderOpen, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ManageGallery = () => {
    const [events, setEvents] = useState([]);
    const [galleryData, setGalleryData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchData = async () => {
        try {
            const resEvents = await axios.get(`${backendUrl}/api/admin/list-events`);
            const resGallery = await axios.get(`${backendUrl}/api/admin/list-gallery`);
            
            if (resEvents.data.success) {
                setEvents(resEvents.data.events.filter(e => e.category === 'finished'));
            }
            if (resGallery.data.success) setGalleryData(resGallery.data.gallery);
        } catch (error) { toast.error("Error fetching data"); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (images.length === 0) return toast.error("Please select images first");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('eventId', selectedEvent._id);
            Array.from(images).forEach(img => formData.append('images', img));

            const { data } = await axios.post(`${backendUrl}/api/admin/add-gallery`, formData, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                setImages([]);
                fetchData();
            }
        } catch (error) { toast.error("Upload failed"); }
        finally { setLoading(false); }
    };

    const removeImg = async (galleryId, url) => {
        if(!window.confirm("Permanent delete this photo?")) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/remove-gallery-img`, { galleryId, imageUrl: url }, { headers: { token } });
            if (data.success) {
                toast.success("Image removed");
                fetchData();
            }
        } catch (error) { toast.error("Delete failed"); }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <h1 className="text-3xl font-russo dark:text-white mb-10 flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg shadow-purple-200 dark:shadow-none">
                    <FolderOpen size={28}/>
                </div>
                Manage Event Gallery
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                    const eventGallery = galleryData.find(g => g.eventId?._id === event._id);
                    return (
                        <div key={event._id} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-purple-600">
                            <h3 className="font-bold text-xl dark:text-white mb-2 line-clamp-1">{event.title}</h3>
                            <p className="text-xs text-slate-500 mb-4 flex items-center gap-2 font-medium">
                                <Calendar size={14} className="text-purple-600"/> {new Date(event.date).toLocaleDateString()}
                            </p>
                            
                            <div className="flex justify-between items-center mt-6">
                                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                                    <ImageIcon size={16}/>
                                    <span className="text-xs font-bold">{eventGallery?.images.length || 0} Photos</span>
                                </div>
                                <button onClick={() => setSelectedEvent(event)} className="bg-purple-600 text-white p-3 rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none active:scale-95">
                                    <Plus size={20}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border dark:border-slate-800 shadow-2xl"
                        >
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md">
                                <X size={24} className="dark:text-white"/>
                            </button>
                            
                            <div className="mb-8">
                                <h2 className="text-2xl font-russo dark:text-white mb-2">Gallery: {selectedEvent.title}</h2>
                                <p className="text-slate-400 text-sm">Upload multiple photos from the event.</p>
                            </div>
                            
                            <form onSubmit={handleUpload} className="mb-10 p-8 border-2 border-dashed rounded-4xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <ImagePlus size={40} className="text-slate-300 mb-2"/>
                                    <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                                </div>
                                <button disabled={loading || images.length === 0} type="submit" className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-100">
                                    {loading ? <Loader2 className="animate-spin" /> : <><ImagePlus size={20}/> Upload {images.length > 0 ? `${images.length} Photos` : 'to Gallery'}</>}
                                </button>
                            </form>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {galleryData.find(g => g.eventId?._id === selectedEvent._id)?.images.map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border dark:border-slate-800">
                                        <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="gallery" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => removeImg(galleryData.find(g => g.eventId?._id === selectedEvent._id)._id, url)} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-all">
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageGallery;