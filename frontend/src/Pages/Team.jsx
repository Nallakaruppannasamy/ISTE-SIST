import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, ArrowUp, Search, ExternalLink } from 'lucide-react';
import axios from 'axios';

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-2xl animate-pulse h-72 w-full flex flex-col justify-between">
    <div className="aspect-square bg-slate-300 dark:bg-slate-700 w-full rounded-xl mb-3" />
    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded mb-1 w-3/4 mx-auto" />
    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2 mx-auto" />
  </div>
);

// SVG Wave Divider
const WaveDivider = () => (
  <div className="w-full overflow-hidden leading-none my-12">
    <svg className="relative block w-full h-12.5" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-purple-600/10 dark:fill-purple-600/5"></path>
    </svg>
  </div>
);

const TeamCard = ({ name, role, img, linkedin, isCore }) => {
  const isHead = role.toLowerCase().includes('head');

  const getRoleAccent = (pos) => {
    if (["Chairperson", "Vice Chairperson", "Secretary", "Treasurer"].includes(pos)) return 'border-l-purple-500';
    if (pos === "Executive Council Member") return 'border-l-indigo-500';
    if (pos.toLowerCase().includes("head")) return 'border-l-amber-500';
    if (pos.toLowerCase().includes("technical")) return 'border-l-cyan-500';
    return 'border-l-slate-400';
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -6 }}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border-t dark:border-slate-800 border-x border-b border-l-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between max-w-62.5 mx-auto w-full ${getRoleAccent(role)} ${isCore ? 'ring-2 ring-purple-600/20' : ''}`}
    >
      <div className="aspect-square relative overflow-hidden bg-slate-50 dark:bg-slate-950 w-full">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-3.5 text-center space-y-1 flex-1 flex flex-col justify-center items-center relative">
        {isHead && (
          <span className="text-[8px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
            Domain Head
          </span>
        )}
        
        <h3 className="font-bold text-slate-800 dark:text-white text-xs truncate w-full">{name}</h3>
        <p className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest truncate w-full mb-1.5">
          {role}
        </p>
        
        <div className="pt-2 w-full flex justify-center border-t dark:border-purple-600 mt-auto">
          <a
            href={linkedin}
            target="_blank"
            rel="noreferrer"
            title={`Visit ${name}'s LinkedIn Profile`}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-lg group/link"
          >
            <Linkedin size={11} className="text-slate-400 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400" />
            <span className="text-[9px] font-bold text-slate-400 group-hover/link:text-slate-600 dark:group-hover/link:text-slate-200 flex items-center gap-0.5">
              LinkedIn <ExternalLink size={8} />
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const Team = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [showBackToTop, setShowBackToTop] = useState(false); 
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; 

  const fetchTeam = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/list-team`);
      if (data.success) setTeamData(data.members);
    } catch (error) {
      console.error("Error fetching team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { title: "Core Team", filter: ["Chairperson", "Vice Chairperson", "Secretary", "Treasurer"], id: "core" },
    { title: "Executive Council", filter: ["Executive Council Member"], id: "exec" },
    { title: "Management Team", filter: ["Management Team Head", "Management Team Member"], id: "mgmt" },
    { title: "Technical Team", filter: ["Technical Team Head", "Technical Team Member"], id: "tech" },
    { title: "Media Team", filter: ["Media Team Head", "Media Team Member"], id: "media" },
    { title: "Design Team", filter: ["Design Team Head", "Design Team Member"], id: "design" },
    { title: "PR Team", filter: ["PR Team Head", "PR Team Member"], id: "pr" },
  ];

  const filteredData = teamData.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen bg-white dark:bg-slate-900 transition-colors duration-500 bg-pattern-dots">
      <div className="container mx-auto max-w-6xl">

        {/* Header and Search */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-russo mb-4 dark:text-white">
            Meet the <span className="text-purple-600">Squad</span>
          </h1>
          <div className="w-24 h-1.5 bg-purple-600 mx-auto rounded-full mb-10"></div>

          <div className="max-w-md mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border dark:border-slate-800 dark:bg-slate-800/50 dark:text-white glass-effect outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-lg"
            />
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        {!searchQuery && (
          <div className="sticky top-24 z-40 mb-16 px-4">
            <div className="flex flex-nowrap md:flex-wrap md:justify-center gap-2 py-3 px-4 glass-effect rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(cat.id)}
                  className="whitespace-nowrap shrink-0 px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 dark:text-white hover:bg-purple-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          categories.map((cat, index) => {
            const membersInCat = filteredData.filter(m => cat.filter.includes(m.position))
              .sort((a, b) => {
                const posA = cat.filter.indexOf(a.position);
                const posB = cat.filter.indexOf(b.position);
                return posA - posB;
              });

            if (membersInCat.length === 0) return null;

            return (
              <div key={cat.id} id={cat.id} className="mb-24">
                <motion.h2
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-3xl font-russo text-center mb-12 dark:text-white flex items-center justify-center gap-4"
                >
                  <span className="w-12 h-0.5 bg-purple-600/30"></span>
                  {cat.title}
                  <span className="w-12 h-0.5 bg-purple-600/30"></span>
                </motion.h2>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ staggerChildren: 0.08 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center"
                >
                  {membersInCat.map((member) => (
                    <TeamCard
                      key={member._id}
                      name={member.name}
                      role={member.position}
                      img={member.image}
                      linkedin={member.linkedin}
                      isCore={cat.id === "core"}
                    />
                  ))}
                </motion.div>
                {index < categories.length - 1 && <WaveDivider />}
              </div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 p-4 bg-purple-600 text-white rounded-full shadow-2xl z-50 hover:bg-purple-700 transition-colors"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;