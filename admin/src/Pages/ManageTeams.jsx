import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Trash2, Linkedin, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

const ManageTeams = () => {
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [image, setImage] = useState(false);

    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    // 1. Define the specific order of categories and roles
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

    // Create a flat list of roles for the dropdown selection
    const allRoles = categories.flatMap(cat => cat.roles);

    const fetchMembers = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/list-team`, { headers: { token } });
            if (data.success) {
                setMembers(data.members);
            }
        } catch (error) {
            toast.error("Error fetching team members");
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
                setName(''); setPosition(''); setLinkedin(''); setImage(false);
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

    const removeMember = async (id) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/remove-team`, { id }, { headers: { token } });
            if (data.success) {
                toast.success(data.message);
                fetchMembers();
            }
        } catch (error) {
            toast.error("Error removing member");
        }
    }

    useEffect(() => { fetchMembers(); }, []);

    return (
        <div className="p-4 md:p-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg text-white"><Users size={24} /></div>
                    <h1 className="text-2xl font-russo dark:text-white">Manage Teams</h1>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all font-bold"
                >
                    <Plus size={20} /> {showForm ? 'Close' : 'Add Member'}
                </button>
            </div>

            {/* Add Member Form */}
            {showForm && (
                <form onSubmit={onSubmitHandler} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 mb-8 max-w-2xl">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 mb-2">
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden">
                                    {image ? (
                                        <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="text-slate-400 flex flex-col items-center"><Upload size={20} /><span className="text-[10px]">Photo</span></div>
                                    )}
                                </div>
                            </label>
                            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image-upload" hidden required />
                            <p className="text-xs text-slate-400">Upload profile photo (PNG, JPG)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" className="p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600" required />
                            
                            <select 
                                value={position} 
                                onChange={(e) => setPosition(e.target.value)} 
                                className="p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600" 
                                required
                            >
                                <option value="">Select Position</option>
                                {allRoles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>

                            <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} type="url" placeholder="LinkedIn URL" className="p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-600 md:col-span-2" required />
                        </div>
                    </div>
                    <button disabled={loading} type="submit" className="mt-6 w-full bg-purple-600 text-white p-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
                        {loading ? 'Uploading...' : 'Save Member'}
                    </button>
                </form>
            )}

            {/* Categorized Members Display */}
            {categories.map((category, index) => {
                const filteredMembers = members.filter(m => category.roles.includes(m.position));
                
                // Only show category if it has members
                if (filteredMembers.length === 0) return null;

                return (
                    <div key={index} className="mb-12">
                        <h2 className="text-xl font-bold text-purple-600 mb-6 border-b pb-2 flex items-center gap-2">
                            <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                            {category.title}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMembers.map((item) => (
                                <div key={item._id} className="bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden group shadow-sm">
                                    <div className="aspect-square relative overflow-hidden bg-slate-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <button onClick={() => removeMember(item._id)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                                        <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mb-3">{item.position}</p>
                                        <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <Linkedin size={18} />
                                            <span className="text-xs font-semibold">LinkedIn</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ManageTeams;