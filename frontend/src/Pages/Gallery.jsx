import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Calendar, MapPin, Maximize2, Download, 
    ChevronLeft, ChevronRight, Play, Pause, 
    LayoutGrid, Columns, ArrowUp, Camera, ImageIcon 
} from 'lucide-react';

// --- COMPONENT: Skeleton Shimmer Card ---
const SkeletonCard = () => (
    <div className="aspect-4/5 rounded-4xl shimmer border border-slate-100 dark:border-slate-800"></div>
);

// --- COMPONENT: Section Transition Divider ---
const SectionDivider = () => (
    <div className="w-full overflow-hidden leading-none my-12 opacity-10">
        <svg className="relative block w-full h-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#9333ea"></path>
        </svg>
    </div>
);

const Gallery = () => {
    const [galleryData, setGalleryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    // Layout Toggle State
    const [viewType, setViewType] = useState("masonry"); 

    // Lightbox State
    const [selectedImg, setSelectedImg] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentEventImages, setCurrentEventImages] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const fetchData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/list-gallery`);
            if (data.success) setGalleryData(data.gallery);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        const handleScroll = () => setShowBackToTop(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lightbox Navigation Logic
    const nextImg = useCallback(() => {
        if (currentEventImages.length === 0) return;
        const nextIdx = (currentIndex + 1) % currentEventImages.length;
        setCurrentIndex(nextIdx);
        setSelectedImg(currentEventImages[nextIdx]);
    }, [currentIndex, currentEventImages]);

    const prevImg = useCallback(() => {
        if (currentEventImages.length === 0) return;
        const prevIdx = (currentIndex - 1 + currentEventImages.length) % currentEventImages.length;
        setCurrentIndex(prevIdx);
        setSelectedImg(currentEventImages[prevIdx]);
    }, [currentIndex, currentEventImages]);

    // Slideshow Logic
    useEffect(() => {
        let interval;
        if (isPlaying && selectedImg) {
            interval = setInterval(nextImg, 3000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, selectedImg, nextImg]);

    // Keyboard Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImg) return;
            if (e.key === "ArrowRight") nextImg();
            if (e.key === "ArrowLeft") prevImg();
            if (e.key === "Escape") setSelectedImg(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImg, nextImg, prevImg]);

    const openLightbox = (url, images, index) => {
        setSelectedImg(url);
        setCurrentEventImages(images);
        setCurrentIndex(index);
        setIsPlaying(false);
    };

    const filteredData = activeFilter === "All" 
        ? galleryData 
        : galleryData.filter(item => item.eventId?._id === activeFilter);

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 relative overflow-hidden">
            {/* Dots Flourish Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#9333ea 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="container mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-russo text-slate-900 dark:text-white mb-4">
                        Event <span className="text-purple-600">Gallery</span>
                    </motion.h1>
                    <div className="w-24 h-2 bg-purple-600 mx-auto rounded-full mb-12 shadow-lg shadow-purple-500/20"></div>

                    {/* Filter & Toggle Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 sticky top-24 z-40 p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl mb-12">
                        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 w-full md:w-auto px-2">
                            <button onClick={() => setActiveFilter("All")} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase transition-all ${activeFilter === "All" ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                                All Events
                            </button>
                            {galleryData.map((item) => (
                                <button key={item._id} onClick={() => setActiveFilter(item.eventId?._id)} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase transition-all ${activeFilter === item.eventId?._id ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                                    {item.eventId?.title}
                                </button>
                            ))}
                        </div>
                        
                        {/* Masonry/Grid Toggle */}
                        <div className="flex bg-slate-200 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-300 dark:border-white/5">
                            <button onClick={() => setViewType("masonry")} className={`p-2 rounded-xl transition-all ${viewType === "masonry" ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm' : 'text-slate-500'}`}><Columns size={18}/></button>
                            <button onClick={() => setViewType("grid")} className={`p-2 rounded-xl transition-all ${viewType === "grid" ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm' : 'text-slate-500'}`}><LayoutGrid size={18}/></button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-24 opacity-30">
                        <Camera size={80} className="text-slate-900 dark:text-white mx-auto mb-4" />
                        <p className="text-xl font-russo text-slate-900 dark:text-white uppercase tracking-widest">No Memories Found</p>
                    </div>
                ) : (
                    filteredData.map((item, eventIdx) => (
                        <div key={item._id} className="mb-24">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-slate-200 dark:border-white/10 pb-8">
                                <div>
                                    <h2 className="text-4xl font-russo text-slate-900 dark:text-white mb-2">{item.eventId?.title}</h2>
                                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        <span className="flex items-center gap-2"><Calendar size={14} className="text-purple-600"/> {new Date(item.eventId?.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-2"><MapPin size={14} className="text-purple-600"/> {item.eventId?.venue}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-2xl uppercase">{item.images.length} Photos</span>
                            </div>

                            <motion.div 
                                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                                transition={{ staggerChildren: 0.1 }}
                                className={viewType === "masonry" ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}
                            >
                                {item.images.map((url, i) => (
                                    <motion.div 
                                        key={i} 
                                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                                        whileHover={{ y: -10, scale: 1.02, rotateZ: 0.5 }}
                                        className="relative group cursor-zoom-in rounded-[2.5rem] overflow-hidden shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5"
                                        onClick={() => openLightbox(url, item.images, i)}
                                    >
                                        <img src={url} loading="lazy" className="w-full h-auto object-cover transition-all duration-700" alt="event capture" />
                                        <div className="absolute inset-0 bg-linear-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white flex items-center gap-3">
                                                <Maximize2 size={18}/>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">View Full</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                            {eventIdx < filteredData.length - 1 && <SectionDivider />}
                        </div>
                    ))
                )}
            </div>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-200 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-[20px]"
                    >
                        {/* Header Controls */}
                        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                             <div className="bg-white/10 px-6 py-2 rounded-full border border-white/10 text-white font-bold text-[10px] uppercase tracking-[0.3em]">
                                {currentIndex + 1} / {currentEventImages.length}
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => setIsPlaying(!isPlaying)} className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                    {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                                </button>
                                <button onClick={() => setSelectedImg(null)} className="p-4 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                    <X size={24}/>
                                </button>
                             </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button onClick={prevImg} className="absolute left-6 p-4 text-white/30 hover:text-white transition-all hidden md:block group">
                            <ChevronLeft size={60} className="group-hover:-translate-x-2 transition-transform"/>
                        </button>
                        <button onClick={nextImg} className="absolute right-6 p-4 text-white/30 hover:text-white transition-all hidden md:block group">
                            <ChevronRight size={60} className="group-hover:translate-x-2 transition-transform"/>
                        </button>

                        {/* Main Image */}
                        <motion.img 
                            key={selectedImg}
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            src={selectedImg} 
                            className="max-w-full max-h-[80vh] rounded-4xl shadow-2xl object-contain border border-white/10" 
                        />
                        
                        <div className="mt-8">
                            <a href={selectedImg} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/40">
                                <Download size={20}/> Download High-Res
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back to Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-10 right-10 p-5 bg-purple-600 text-white rounded-full shadow-2xl z-50 hover:bg-purple-700 transition-colors"
                    >
                        <ArrowUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;