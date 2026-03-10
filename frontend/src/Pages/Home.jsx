import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';

const Home = () => {
    // Animation Variants for a clean, consistent feel
    const fadeIn = {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const slideLeft = {
        initial: { opacity: 0, x: 70 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 }
    };

    const slideRight = {
        initial: { opacity: 0, x: -70 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true },
        transition: { duration: 0.8 }
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 transition-colors duration-500">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-10 px-6 overflow-hidden">
                {/* Decorative Flake */}
                <motion.img
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    src={assets.flake}
                    className="absolute top-24 right-10 w-16 opacity-40 dark:invert"
                    alt=""
                />

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="z-10"
                >
                    <img src={assets.iste_logo} alt="ISTE Logo" className="h-50 drop-shadow-2xl" />
                </motion.div>

                <div className="w-full max-w-6xl z-10">
                    <svg viewBox="0 0 1320 300" className="w-full">
                        <text x="50%" y="50%" dy=".35em" textAnchor="middle"
                            className="iste-stroke font-russo text-[13rem] md:text-[13rem] stroke-purple-600 dark:stroke-purple-400 stroke-2 fill-transparent">
                            I S T E
                        </text>
                    </svg>
                </div>

                <motion.div {...fadeIn} transition={{ delay: 0.8 }} className="text-center z-10">
                    <h2 className="text-xl md:text-3xl font-ubuntu tracking-[0.3em] text-slate-600 dark:text-slate-300 uppercase">
                        Indian Society For Technical Education
                    </h2>
                    <p className="text-lg md:text-xl font-bold text-purple-600 mt-3 tracking-[0.5em] uppercase">
                        SIST Student Chapter
                    </p>
                </motion.div>
            </section>

            {/* --- WHAT IS ISTE --- */}
            <section className="py-24 container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div {...fadeIn}>
                    <img src={assets.think} alt="Think GIF" className="rounded-[2.5rem] shadow-2xl w-full hover:scale-105 transition-transform duration-500" />
                </motion.div>
                <motion.div {...slideLeft}>
                    <h1 className="text-4xl md:text-5xl font-russo mb-8 dark:text-white leading-tight">
                        What is <span className="text-purple-600">ISTE</span>
                        <img src={assets.bulb5} className="inline h-14 ml-4 animate-pulse" alt="bulb" />
                    </h1>
                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-open-sans">
                        The Indian society for technical education is a national, non-profit making, government aided society.
                        At present, ISTE have a very large and effective membership base which involves 97,286 technical teachers,
                        5,66,466 student members, more than 2,345 institutional members, 1,166 faculty chapters and 1,280 students’ chapters
                        throughout the country.
                    </p>
                </motion.div>
            </section>

            {/* --- WHAT WE DO --- */}
            <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <motion.div {...slideRight} className="order-2 md:order-1">
                        <h1 className="text-4xl md:text-5xl font-russo mb-8 dark:text-white">
                            What we <span className="text-purple-600">Do</span>
                            <img src={assets.paper3} className="inline h-14 ml-4" alt="paper" />
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-open-sans">
                            We provide assistance in the development of top quality professional engineers and technicians needed by the industry
                            and other organizations. We provide guidance and training to students to develop better learning.
                        </p>
                    </motion.div>
                    <motion.div {...fadeIn} className="order-1 md:order-2">
                        <img src={assets.working} alt="Working GIF" className="rounded-[2.5rem] shadow-2xl w-full" />
                    </motion.div>
                </div>
            </section>

            {/* --- ABOUT SIST --- */}
            <section className="py-24 container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div {...fadeIn}>
                    <img src={assets.campus} alt="SIST Campus" className="rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-slate-800" />
                </motion.div>
                <motion.div {...slideLeft}>
                    <h1 className="text-4xl md:text-5xl font-russo mb-8 dark:text-white">
                        About <span className="text-purple-600">SIST</span>
                        <img src={assets.bulb5} className="inline h-12 ml-4" alt="bulb" />
                    </h1>
                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-open-sans">
                        Sathyabama Institute of Science and Technology (SIST), established in 1987, is an esteemed educational institution
                        located in Chennai, Tamil Nadu, India. With state-of-the-art facilities and a strong focus on research and innovation,
                        the campus provides students with a holistic learning experience.
                    </p>
                </motion.div>
            </section>

            {/* --- CHENNAI OMR --- */}
            <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <motion.div {...slideRight} className="order-2 md:order-1">
                        <h1 className="text-4xl md:text-5xl font-russo mb-8 dark:text-white">
                            Chennai <span className="text-purple-600">OMR</span>
                        </h1>
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-open-sans">
                            Chennai, in Tamil Nadu, is a vibrant blend of history and culture. Home to landmarks like Marina Beach
                            and Kapaleeshwarar Temple, the city reflects its rich heritage. It strikes a balance between tradition
                            and modernity, making it a captivating destination and a tech hub.
                        </p>
                    </motion.div>
                    <motion.div {...fadeIn} className="order-1 md:order-2">
                        <img src={assets.chennai} alt="Chennai" className="rounded-[2.5rem] shadow-2xl w-full" />
                    </motion.div>
                </div>
            </section>

            {/* --- ABOUT ISTE-SIST (Historical Info) --- */}
            <section className="py-24 container mx-auto px-6">
                <motion.div
                    {...fadeIn}
                    className="bg-linear-to-br from-purple-600 to-indigo-700 rounded-[3rem] p-12 text-white shadow-2xl text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-russo mb-8">About <span className="text-purple-200">ISTE-SIST</span></h1>
                    <p className="text-xl leading-relaxed opacity-90 max-w-4xl mx-auto font-ubuntu">
                        ISTE SIST have organized numerous events since its formation in 2017. By the academic year of 2022-23,
                        we have organized 20+ events. Our major highlight so far has been the Monsoon event, including domains like Quiz,
                        Coding, and Paper presentation. Last year, over 400+ participants registered for our IOT-Prototyping workshop.
                    </p>
                </motion.div>
            </section>

            {/* --- MISSION & VISION CARDS --- */}
            <section className="py-24 container mx-auto px-6 grid md:grid-cols-3 gap-10">
                {[
                    { title: "Vision", img: assets.idea, text: "Our aim is to empower students in tech education, fostering innovation, collaboration, and continuous learning." },
                    { title: "Events", img: assets.create, text: "We conduct many events that target a particular set of skills that help in developing logic and creativity." },
                    { title: "Mission", img: assets.roc, text: "Our mission is to empower students through continuous learning, fostering innovation, and promoting problem-solving." }
                ].map((item, idx) => (
                    <motion.div
                        key={idx}
                        {...fadeIn}
                        transition={{ delay: idx * 0.2 }}
                        whileHover={{ y: -20 }}
                        className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 text-center"
                    >
                        <img src={item.img} alt={item.title} className="h-24 mx-auto mb-8" />
                        <h2 className="text-3xl font-russo mb-4 dark:text-white">{item.title}</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-open-sans">
                            {item.text}
                        </p>
                    </motion.div>
                ))}
            </section>

        </div>
    );
};

export default Home;