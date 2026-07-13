import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
    Users, Plus, Trash2, Linkedin, Upload, Download, 
    Search, X, Check, ArrowUp, ArrowDown, Briefcase, 
    Layers, Image as ImageIcon, Eye, AlertCircle, Copy
} from 'lucide-react';
import { toast } from 'react-toastify';

const ManageTeams = () => {
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    // Form States
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [image, setImage] = useState(false);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [cropScale, setCropScale] = useState(100);

    const fileInputRef = useRef(null);

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    const categories = [
        { title: "Chairperson", roles: ["Chairperson"] },
        { title: "Vice Chairperson", roles: ["Vice Chairperson"] },
        { title: "Secretary", roles: ["Secretary"] },
        { title: "Treasurer", roles: ["Treasurer"] },
        { title: "Executive Council", roles: ["Executive Council Member"] },
        { title: "Management Team", roles: ["Management Team Head", "Management Team Member"] },
        { title: "Technical Team", roles: ["Technical Team Head", "Technical Team Member"] },
        { title: "Media Team", roles: ["Media Team Head", "Media Team Member"] },
        { title: "Design Team", roles: ["Design Team Head", "Design Team Member"] },
        { title: "PR Team", roles: ["PR Team Head", "PR Team Member"] },
    ];

    const allRoles = categories.flatMap(cat => cat.roles);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${backendUrl}/api/admin/list-team`, { headers: { token } });
            if (data.success) {
                setMembers(data.members);
            }
        } catch (error) {
            toast.error("Error fetching team members");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!position) return toast.error("Please select a position");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('position', position);
            formData.append('linkedin', linkedin);
            formData.append('image', image);

            const { data } = await axios.post(`${backendUrl}/api/admin/add-team`, formData, { 
                headers: { token }
            });

            if (data.success) {
                toast.success(data.message);
                setShowForm(false);
                setName(''); setPosition(''); setLinkedin(''); setImage(false); setCropScale(100);
                fetchMembers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to add member");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = (id, memberName) => {
        let isUndone = false;
        const toastId = toast.info(
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">Removing {memberName}...</span>
                <button 
                    onClick={() => { isUndone = true; toast.dismiss(toastId); }} 
                    className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] uppercase font-black px-2 py-1 rounded shadow-sm"
                >
                    Undo
                </button>
            </div>,
            { autoClose: 4000, closeOnClick: false, draggable: false }
        );

        setTimeout(() => {
            if (!isUndone) {
                commitRemove(id);
            } else {
                toast.success("Deletion cancelled successfully");
            }
        }, 4100);
    };

    const commitRemove = async (id) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/remove-team`, { id }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                fetchMembers();
            }
        } catch (error) {
            toast.error("Error removing member");
        }
    };

    const moveMemberOrder = (id, direction) => {
        const index = members.findIndex(m => m._id === id);
        if (index === -1) return;
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= members.length) return;

        const updated = [...members];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setMembers(updated);
        toast.success("Order updated locally");
    };

    const handleNameChange = (val) => {
        setName(val);
        const lower = val.toLowerCase();
        if (position === "") {
            if (lower.includes("chairperson")) setPosition("Chairperson");
            else if (lower.includes("vice")) setPosition("Vice Chairperson");
            else if (lower.includes("secretary")) setPosition("Secretary");
            else if (lower.includes("treasurer")) setPosition("Treasurer");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };

    const handleDragLeave = () => {
        setIsDraggingFile(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setImage(e.dataTransfer.files[0]);
        }
    };

    const exportToExcel = () => {
        if (members.length === 0) {
            return toast.error("No team data available to export");
        }
        const headers = "Name,Role,LinkedIn URL\n";
        const rows = members.map(m => 
            `"${m.name.replace(/"/g, '""')}","${m.position.replace(/"/g, '""')}","${m.linkedin.replace(/"/g, '""')}"`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ISTE_Team_Details_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => { fetchMembers(); }, []);

    const { filteredMembers, roleCounters, completionPercentage } = useMemo(() => {
        let current = [...members];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            current = current.filter(m => 
                m.name.toLowerCase().includes(query) || 
                m.position.toLowerCase().includes(query)
            );
        }

        const counters = { core: 0, executive: 0, management: 0, technical: 0, pr: 0, design: 0, media: 0 };
        members.forEach(m => {
            if (["Chairperson", "Vice Chairperson", "Secretary", "Treasurer"].includes(m.position)) counters.core++;
            else if (m.position === "Executive Council Member") counters.executive++;
            else if (m.position.includes("Management Team")) counters.management++;
            else if (m.position.includes("Technical Team")) counters.technical++;
            else if (m.position.includes("PR Team")) counters.pr++;
            else if (m.position.includes("Design Team")) counters.design++;
            else if (m.position.includes("Media Team")) counters.media++;
        });

        const targetStrength = 30;
        const pct = Math.min(Math.round((members.length / targetStrength) * 100), 100);

        return { filteredMembers: current, roleCounters: counters, completionPercentage: pct };
    }, [members, searchQuery]);

    const getRoleAccent = (pos) => {
        if (["Chairperson", "Vice Chairperson", "Secretary", "Treasurer"].includes(pos)) return 'border-l-purple-500 ring-purple-500/10 shadow-purple-500/5';
        if (pos === "Executive Council Member") return 'border-l-indigo-500 ring-indigo-500/10 shadow-indigo-500/5';
        if (pos.includes("Head")) return 'border-l-amber-500 ring-amber-500/10 shadow-amber-500/5';
        if (pos.includes("Technical")) return 'border-l-cyan-500 ring-cyan-500/10 shadow-cyan-500/5';
        return 'border-l-slate-400 ring-slate-500/5 shadow-slate-500/5';
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .stagger-card {
                    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
            `}} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-600 rounded-xl text-white shadow-md shadow-purple-600/20"><Users size={24} /></div>
                    <div>
                        <h1 className="text-2xl font-russo dark:text-white">Manage Teams</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Organize committee categories, manage links, and configure visibility.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button 
                        onClick={exportToExcel}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border dark:border-slate-800 px-4 py-2.5 rounded-xl text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-sm shadow-sm"
                    >
                        <Download size={18} /> Export Excel
                    </button>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-all font-bold text-sm shadow-md shadow-purple-600/10"
                    >
                        <Plus size={18} /> {showForm ? 'Close Workspace' : 'Add Member'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm xl:col-span-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Core Team</span>
                        <p className="text-xl font-russo text-purple-600 dark:text-purple-400 mt-1">{roleCounters.core}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Exec Council</span>
                        <p className="text-xl font-russo text-indigo-600 dark:text-indigo-400 mt-1">{roleCounters.executive}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Technical</span>
                        <p className="text-xl font-russo text-cyan-600 mt-1">{roleCounters.technical}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Management</span>
                        <p className="text-xl font-russo text-amber-600 mt-1">{roleCounters.management}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">PR Team</span>
                        <p className="text-xl font-russo text-rose-600 mt-1">{roleCounters.pr}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Design</span>
                        <p className="text-xl font-russo text-emerald-600 mt-1">{roleCounters.design}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col justify-between">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider leading-tight">Media</span>
                        <p className="text-xl font-russo text-blue-600 mt-1">{roleCounters.media}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-purple-600 transition-all duration-1000" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-xs font-russo dark:text-white">{completionPercentage}%</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Roster Strength</span>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{members.length} Active Profiles</p>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <form onSubmit={onSubmitHandler} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm lg:col-span-2">
                        <h3 className="text-sm font-bold dark:text-white uppercase tracking-wider text-slate-400 mb-4">Onboarding Attributes</h3>
                        
                        <div className="flex flex-col gap-4">
                            <div 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`group cursor-pointer rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center transition-all min-h-27.5 ${
                                    isDraggingFile 
                                    ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/20' 
                                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-slate-50/50 dark:bg-slate-900/40'
                                }`}
                            >
                                <input ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} type="file" hidden />
                                {image ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full px-2">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border dark:border-slate-700 bg-slate-100 relative shadow-sm">
                                            <img 
                                                src={URL.createObjectURL(image)} 
                                                className="w-full h-full object-cover transition-transform duration-200" 
                                                style={{ transform: `scale(${cropScale / 100})` }} 
                                                alt="Thumb Preview" 
                                            />
                                        </div>
                                        <div className="flex-1 w-full space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                                <span>Zoom / Image Cropper Bounds</span>
                                                <span>{cropScale}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="100" 
                                                max="200" 
                                                value={cropScale} 
                                                onChange={(e) => { e.stopPropagation(); setCropScale(parseInt(e.target.value)); }} 
                                                onClick={(e) => e.stopPropagation()} 
                                                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-1">
                                        <Upload size={20} className="mx-auto text-slate-400 group-hover:text-purple-500 transition-colors" />
                                        <p className="text-xs font-semibold dark:text-slate-300">Drag & drop profile picture image here or click to browse</p>
                                        <p className="text-[10px] text-slate-400">Supported formats: JPG, PNG square aspects</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input value={name} onChange={(e) => handleNameChange(e.target.value)} type="text" placeholder="Full Identity Name" className="p-3 text-sm rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 border-slate-200" required />
                                
                                <select 
                                    value={position} 
                                    onChange={(e) => setPosition(e.target.value)} 
                                    className="p-3 text-sm rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 border-slate-200" 
                                    required
                                >
                                    <option value="">Select Position Placement</option>
                                    {allRoles.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>

                                <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} type="url" placeholder="Paste LinkedIn Profile URL Link" className="p-3 text-sm rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 border-slate-200 sm:col-span-2" required />
                            </div>
                        </div>
                        <button disabled={loading} type="submit" className="mt-5 w-full bg-purple-600 text-white p-3 rounded-xl font-bold hover:bg-purple-700 transition-all text-sm shadow-md active:scale-[0.99]">
                            {loading ? 'Uploading Assets...' : 'Commit New Member'}
                        </button>
                    </form>

                    <div className="bg-slate-100/60 dark:bg-slate-900/40 p-6 rounded-3xl border dark:border-slate-800 flex flex-col justify-center items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-4 flex items-center gap-1.5"><Eye size={12}/> Live UI Card Preview</span>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden w-full max-w-60 shadow-sm border-l-4 border-l-purple-600">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                                {image ? (
                                    <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" style={{ transform: `scale(${cropScale / 100})` }} alt="Live display preview" />
                                ) : (
                                    <ImageIcon size={32} className="text-slate-300" />
                                )}
                            </div>
                            <div className="p-4 text-center space-y-0.5">
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{name || 'Identity Fullname'}</h4>
                                <p className="text-[10px] text-purple-600 font-extrabold uppercase tracking-widest truncate">{position || 'Position Assignment'}</p>
                                <div className="pt-2 text-slate-300 flex items-center justify-center gap-1 text-[11px] font-semibold"><Linkedin size={14}/> Profile Linked</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm mb-6 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Search specific committee name indices or configuration roles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-purple-600 dark:text-white text-xs placeholder-slate-400 font-medium"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t dark:border-slate-800/60 pt-2">
                    <button 
                        onClick={() => setActiveTab("All")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                            activeTab === "All" ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        All Divisions ({members.length})
                    </button>
                    {categories.map((cat, idx) => {
                        const count = members.filter(m => cat.roles.includes(m.position)).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(cat.title)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                    activeTab === cat.title ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {cat.title} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden shadow-sm space-y-3 p-4 animate-pulse">
                            <div className="aspect-square bg-slate-200 dark:bg-slate-800 w-full rounded-xl" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mx-auto" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto" />
                        </div>
                    ))}
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed dark:border-slate-800">
                    <AlertCircle size={36} className="mx-auto text-slate-300 mb-3" />
                    <h4 className="font-bold dark:text-white text-sm">No matched team profiles found</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Try altering the keyword text parameters or active tab targets.</p>
                </div>
            ) : (
                categories.map((category, catIndex) => {
                    if (activeTab !== "All" && activeTab !== category.title) return null;

                    const filteredMembersByCat = filteredMembers.filter(m => category.roles.includes(m.position));
                    if (filteredMembersByCat.length === 0) return null;

                    return (
                        <div key={catIndex} className="mb-10 animate-fade-in-up" style={{ animationDelay: `${catIndex * 50}ms` }}>
                            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-slate-800/80 pb-1.5">
                                <span className="bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 px-2 py-0.5 rounded-md text-xs font-black">{filteredMembersByCat.length}</span>
                                {category.title}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredMembersByCat.map((item, mIdx) => (
                                    <div 
                                        key={item._id} 
                                        className={`stagger-card group relative bg-white dark:bg-slate-900 rounded-2xl border-t dark:border-slate-800 border-x border-b border-l-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${getRoleAccent(item.position)}`}
                                        style={{ animationDelay: `${Math.min(mIdx * 30, 300)}ms` }}
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-slate-50 dark:bg-slate-950">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            
                                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                                                <div className="flex gap-1 self-start">
                                                    <button onClick={() => moveMemberOrder(item._id, 'up')} className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg transition-all active:scale-95" title="Shift order up"><ArrowUp size={13} /></button>
                                                    <button onClick={() => moveMemberOrder(item._id, 'down')} className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg transition-all active:scale-95" title="Shift order down"><ArrowDown size={13} /></button>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteRequest(item._id, item.name)} 
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all self-end active:scale-95 shadow-md"
                                                    title="Remove execution string"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 text-center space-y-0.5 relative">
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</h3>
                                            <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest truncate">{item.position}</p>
                                            
                                            <div className="pt-2.5 flex justify-center">
                                                <a 
                                                    href={item.linkedin} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl group/link"
                                                >
                                                    <Linkedin size={13} className="text-slate-400 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400" />
                                                    <span className="text-[10px] font-bold text-slate-400 group-hover/link:text-slate-600 dark:group-hover/link:text-slate-200 flex items-center gap-1">
                                                        LinkedIn <Check size={10} className="text-emerald-500" />
                                                    </span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ManageTeams;