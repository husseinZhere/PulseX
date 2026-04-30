import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronRight, HiChevronLeft } from "react-icons/hi2";
import { MdVerified } from "react-icons/md";
import { LuQuote } from "react-icons/lu";
import Container from '../HomeSectionWrapper/HomeSectionWrapper';
import api, { resolveFileUrl } from '../../../../utils/api';

// All story content is static — only the avatar images get replaced by real patient photos
const STATIC_STORIES = [
    {
        id: 1,
        name: "Mohamed Ahmed",
        age: "48",
        condition: "Hypertension",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        quote: "For a long time, my health felt like a puzzle with missing pieces. PulseX gave me a clear picture of my heart health. After 8 months of following my AI-generated plan and weekly check-ins with my doctor, my risk score dropped from 85% to 23%. I finally feel in control.",
        risk: "-62%", time: "8 months", bpm: "-15 BPM", progress: 62,
        tags: ["High Risk", "Recovery", "Lifestyle Change"],
    },
    {
        id: 2,
        name: "Nour El-Din",
        age: "55",
        condition: "Arrhythmia",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
        quote: "I never knew my heartbeat was irregular until PulseX flagged it. The real-time ECG monitoring caught an episode before I even felt symptoms. My cardiologist was able to adjust my treatment immediately. This platform genuinely saved my life.",
        risk: "-45%", time: "6 months", bpm: "Stable", progress: 75,
        tags: ["Early Detection", "Monitoring"],
    },
    {
        id: 3,
        name: "Salma Hassan",
        age: "42",
        condition: "Tachycardia",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
        quote: "Managing a heart condition while raising a family felt impossible. PulseX changed that. The 24/7 vitals tracking lets my doctor monitor me remotely, and the medication reminders mean I never miss a dose. My quality of life has improved dramatically.",
        risk: "-30%", time: "4 months", bpm: "-8 BPM", progress: 55,
        tags: ["Prevention", "Success Story"],
    },
    {
        id: 4,
        name: "Khaled Mansour",
        age: "61",
        condition: "Heart Disease",
        image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400",
        quote: "When I collapsed at work, the paramedics scanned my emergency QR code and instantly knew my full medical history, allergies, and current medications. The doctors say that quick access saved my life. I carry that QR code everywhere now.",
        risk: "-50%", time: "10 months", bpm: "-20 BPM", progress: 85,
        tags: ["Recovery", "Lifestyle Change"],
    },
];

// Fetch real patient photos from published stories and inject them into static slots
const useRealPhotos = (setStories) => {
    useEffect(() => {
        api.get('/api/Story/published', { params: { page: 1, pageSize: 8 } })
            .then(r => {
                // backend returns StoryPagedDto { stories: [...] } or plain array
                const list = Array.isArray(r.data)
                    ? r.data
                    : (r.data?.stories || r.data?.Stories || r.data?.data || []);
                if (!list.length) return;
                setStories(prev => prev.map((story, i) => {
                    const src = list[i];
                    if (!src) return story;
                    // StoryDto field: patientAvatar (camelCase from .NET JSON)
                    const raw = src.patientAvatar || src.PatientAvatar
                        || src.imageUrl || src.ImageUrl
                        || src.coverImage || src.CoverImage
                        || '';
                    const photoUrl = resolveFileUrl(raw);
                    return photoUrl ? { ...story, image: photoUrl } : story;
                }));
            })
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

// Avatar with gradient initials fallback
const StoryAvatar = ({ src, name }) => {
    const [err, setErr] = useState(false);
    useEffect(() => { setErr(false); }, [src]);
    if (src && !err) {
        return <img src={src} alt={name} className="w-40 h-40 rounded-full object-cover border-[6px] border-[#F1F5F9] dark:border-[#1E293B] shadow-inner" onError={() => setErr(true)} />;
    }
    return (
        <div className="w-40 h-40 rounded-full border-[6px] border-[#F1F5F9] dark:border-[#1E293B] bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-4xl font-bold">
            {(name || 'P')[0].toUpperCase()}
        </div>
    );
};

const Stories = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stories, setStories] = useState(STATIC_STORIES);

    useRealPhotos(setStories);

    const nextSlide = () => {
        if (currentIndex < stories.length - 1) setCurrentIndex(prev => prev + 1);
    };
    const prevSlide = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const story = stories[currentIndex];

    return (
        <section id="stories" className="py-24 bg-[#FAFAFA] dark:bg-[#020617] overflow-hidden">
            <Container>
                <motion.div
                    className="text-center mb-16 space-y-3 font-inter"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-4xl font-bold text-black-main-text">Recovery Stories</h2>
                    <p className="text-gray-text-dim2 text-lg">Real patients, real results — inspiring journeys to better heart health</p>
                </motion.div>

                <motion.div
                    className="relative max-w-[1050px] mx-auto font-inter"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                >
                    <div className="bg-white dark:bg-[#0F172A] shadow-lg dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)] rounded-[32px] relative z-10 min-h-[480px] border border-transparent dark:border-gray-800">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col md:flex-row items-center h-full p-8 md:p-14 gap-12"
                            >
                                {/* Left: patient info */}
                                <div className="w-full md:w-1/3 flex flex-col items-center text-center space-y-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-8 md:pb-0 md:pr-12">
                                    <div className="relative">
                                        <StoryAvatar src={story.image} name={story.name} />
                                        <div className="absolute bottom-2 right-4 w-7 h-7 bg-[#10B981] border-4 border-white dark:border-[#0F172A] rounded-full flex items-center justify-center text-white shadow-md dark:shadow-none">
                                            <MdVerified size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-extrabold text-black-main-text">{story.name}</h3>
                                        <p className="text-gray-text-dim2 font-medium">Age {story.age}</p>
                                        <p className="text-brand-main font-bold text-lg">{story.condition}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {story.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] bg-blue-50/50 dark:bg-[#1E293B] text-brand-main dark:text-[#93C5FD] px-2 py-1 rounded-md font-bold tracking-wide">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: quote + stats */}
                                <div className="w-full md:w-2/3 space-y-8 relative">
                                    <div className="relative">
                                        <LuQuote className="text-brand-main w-8 h-8 md:w-12 md:h-12 absolute -top-6 -left-2 md:-top-8 md:-left-10 opacity-30 md:opacity-100" />
                                        <p className="text-lg text-black-main-text leading-relaxed font-medium italic relative z-10">
                                            "{story.quote}"
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-6 sm:gap-0 py-6">
                                        <StatBlock label="Risk Reduction" value={story.risk}  color="text-[#059669]" />
                                        <StatBlock label="Recovery Time"  value={story.time}  color="text-brand-main" />
                                        <StatBlock label="BPM Improved"   value={story.bpm}   color="text-[#D97706]" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-gray-text-dim2 tracking-[0.15em]">Recovery Progress</span>
                                            <span className="text-sm font-bold text-black-main-text">{story.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full w-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-brand-main"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${story.progress}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-[#10B981] font-bold text-xs">
                                            <MdVerified size={16} />
                                            <span>Verified Patient Story</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button onClick={prevSlide} className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-[#111827] rounded-full items-center justify-center text-gray-text-dim2 transition-all z-20 hover:bg-brand-main hover:text-white border border-gray-100 dark:border-gray-700 cursor-pointer left-[-55px] ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <HiChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-[#111827] rounded-full items-center justify-center text-gray-text-dim2 transition-all z-20 hover:bg-brand-main hover:text-white border border-gray-100 dark:border-gray-700 cursor-pointer right-[-55px] ${currentIndex === stories.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <HiChevronRight size={24} />
                    </button>
                </motion.div>

                <div className="flex flex-col items-center mt-6 md:mt-10 space-y-4">
                    <div className="flex md:hidden items-center justify-center gap-6 mb-2">
                        <button onClick={prevSlide} className={`w-10 h-10 bg-white dark:bg-[#111827] rounded-full flex items-center justify-center text-gray-text-dim2 transition-all hover:bg-brand-main hover:text-white border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm dark:shadow-none ${currentIndex === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <HiChevronLeft size={20} />
                        </button>
                        <button onClick={nextSlide} className={`w-10 h-10 bg-white dark:bg-[#111827] rounded-full flex items-center justify-center text-gray-text-dim2 transition-all hover:bg-brand-main hover:text-white border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm dark:shadow-none ${currentIndex === stories.length - 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <HiChevronRight size={20} />
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {stories.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 w-[30px] md:w-[40px] ${currentIndex === i ? 'bg-brand-main' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            />
                        ))}
                    </div>
                    <span className="text-gray-text-dim2 text-sm font-medium">{currentIndex + 1} of {stories.length} stories</span>
                </div>
            </Container>
        </section>
    );
};

const StatBlock = ({ label, value, color }) => (
    <div className="space-y-1 font-inter">
        <p className={`text-3xl font-black ${color}`}>{value}</p>
        <p className="text-[10px] text-gray-text-dim2 font-bold tracking-widest">{label}</p>
    </div>
);

export default Stories;
