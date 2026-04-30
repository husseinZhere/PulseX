import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../HomeSectionWrapper/HomeSectionWrapper';
import { RiPulseLine } from "react-icons/ri";
import api, { resolveFileUrl } from '../../../../utils/api';

// Icons
import { HiStar, HiChevronRight, HiChevronLeft } from "react-icons/hi2";

import { RiHeartPulseLine } from "react-icons/ri";
import { IoSpeedometerOutline } from "react-icons/io5";
import { AiOutlinePieChart } from "react-icons/ai";
import { BsShieldCheck } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { RiSpeedUpFill } from "react-icons/ri";
import { FaUserGroup } from "react-icons/fa6";
import { LuCircleCheckBig } from "react-icons/lu";
import { IoShieldOutline } from "react-icons/io5";

// Demo patient metrics — rotated per doctor slot (landing page illustration only)
const DEMO_METRICS = [
  [
    { label: "Heart Rate",     value: "68 BPM", icon: <CiHeart />,          color: "#EA4747" },
    { label: "Blood Pressure", value: "120/80", icon: <RiSpeedUpFill />,     color: "#75A7B3" },
    { label: "Risk Score",     value: "15%",    icon: <IoShieldOutline />,   color: "#D0791D" },
    { label: "Status",         value: "Normal", icon: <LuCircleCheckBig />,  color: "#00C853", isStatus: true },
  ],
  [
    { label: "Heart Rate",     value: "72 BPM",    icon: <RiHeartPulseLine />, color: "#EF4444" },
    { label: "Blood Pressure", value: "118/75",    icon: <IoSpeedometerOutline />, color: "#3B82F6" },
    { label: "Risk Score",     value: "10%",       icon: <AiOutlinePieChart />, color: "#F59E0B" },
    { label: "Status",         value: "Excellent", icon: <BsShieldCheck />,    color: "#10B981", isStatus: true },
  ],
  [
    { label: "Heart Rate",     value: "65 BPM", icon: <RiHeartPulseLine />,    color: "#EF4444" },
    { label: "Blood Pressure", value: "110/70", icon: <IoSpeedometerOutline />, color: "#3B82F6" },
    { label: "Risk Score",     value: "8%",     icon: <AiOutlinePieChart />,   color: "#F59E0B" },
    { label: "Status",         value: "Stable", icon: <BsShieldCheck />,       color: "#10B981", isStatus: true },
  ],
  [
    { label: "Heart Rate",     value: "75 BPM",  icon: <RiHeartPulseLine />,    color: "#EF4444" },
    { label: "Blood Pressure", value: "115/78",  icon: <IoSpeedometerOutline />, color: "#3B82F6" },
    { label: "Risk Score",     value: "5%",      icon: <AiOutlinePieChart />,   color: "#F59E0B" },
    { label: "Status",         value: "Healthy", icon: <BsShieldCheck />,       color: "#10B981", isStatus: true },
  ],
];

// Fallback static data shown while the API loads or if it fails
const FALLBACK_DOCTORS = [
  { id: 1, name: "Dr. Aya Fathy Saed",  role: "Interventional Cardiologist", exp: "15+ years", rating: "4.9", patients: "2,847", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400", metrics: DEMO_METRICS[0] },
  { id: 2, name: "Dr. Ahmed Mansour",   role: "Cardiac Surgeon",              exp: "12+ years", rating: "4.8", patients: "1,530", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400", metrics: DEMO_METRICS[1] },
  { id: 3, name: "Dr. Sarah El-Amin",   role: "Electrophysiologist",          exp: "10+ years", rating: "4.7", patients: "1,200", image: "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=400&h=400", metrics: DEMO_METRICS[2] },
  { id: 4, name: "Dr. Youssef Halim",   role: "Pediatric Cardiologist",       exp: "8+ years",  rating: "4.9", patients: "980",   image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400", metrics: DEMO_METRICS[3] },
];

// Avatar component with initials fallback
const DocImage = ({ src, name, className }) => {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={name} className={className} onError={() => setErr(true)} />;
  }
  return (
    <div className={`${className} bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-4xl font-bold`}>
      {(name || 'D')[0].toUpperCase()}
    </div>
  );
};

const Doctors = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doctors, setDoctors] = useState(FALLBACK_DOCTORS);

  useEffect(() => {
    api.get('/api/DoctorBooking/doctors', { params: { pageSize: 8 } })
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.doctors || r.data?.data || []);
        if (list.length > 0) {
          setDoctors(list.slice(0, 4).map((d, i) => ({
            id: d.id ?? i,
            name: d.fullName || '',
            role: d.specialization || d.specialty || '',
            exp: d.yearsOfExperience ? `${d.yearsOfExperience}+ years` : '10+ years',
            rating: String(Number(d.averageRating || 0).toFixed(1)),
            patients: String(d.totalRatings || 0),
            image: resolveFileUrl(d.profilePicture || ''),
            metrics: DEMO_METRICS[i % DEMO_METRICS.length],
          })));
        }
      })
      .catch(() => {});
  }, []);

  const nextSlide = () => {
    if (currentIndex < doctors.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const doctor = doctors[currentIndex];

  return (
    <section id="doctors" className="bg-[#FAFAFA] dark:bg-[#020617] py-24 overflow-hidden  font-inter">
      <Container>
        {/* العناوين اللي فوق */}
        <motion.div
          className="text-center mb-16 flex flex-col items-center" // استخدمت flex عشان نضمن التوسط الدقيق
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* العنوان الرئيسي - بنفس الحجم واللون الداكن */}
          <h2 className="text-[32px] md:text-[40px] font-bold text-black-main-text tracking-tight mb-4">
            Expert Cardiologists
          </h2>

          {/* الجملة الفرعية الأولى - واخدة رمادي أغمق شوية ومسافة بسيطة */}
          <p className="text-gray-text-dim2 text-lg md:text-xl mb-6">
            Connect with certified heart specialists for personalized care and monitoring
          </p>

          {/* الفقرة الطويلة - معمولة بمقاس محدد عشان تنزل سطر في نفس الأماكن */}
          <p className="text-gray-text-dim2 text-base md:text-lg max-w-[850px] leading-[1.8] font-light">
            Our AI-powered platform connects you with board-certified cardiologists who specialize in remote
            monitoring and preventive care. Get expert insights, personalized recommendations, and continuous
            support for your heart health journey.
          </p>
        </motion.div>

        <motion.div
          className="relative max-w-[950px] mx-auto px-4 md:px-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >

          {/* زرار الشمال - بيختفي لو إحنا في أول صورة */}
          <button
            onClick={prevSlide}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-[54px] h-[54px] bg-white dark:bg-[#111827] rounded-full items-center justify-center text-[#94a3b8] dark:text-gray-300 shadow-[0_10px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.45)] border border-[#f1f5f9] dark:border-gray-700 cursor-pointer z-30 transition-all duration-300 hover:bg-brand-main hover:text-white hover:shadow-[0_10px_20px_rgba(51,60,245,0.2)] left-[-20px] md:left-[-60px] ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <HiChevronLeft size={24} />
          </button>

          {/* الكارد الرئيسي */}
          <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 md:p-8 xl:p-14 shadow-lg dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)] min-h-[460px] border border-transparent dark:border-gray-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-20 w-full"
              >
                {/* الجزء الشمال: صورة وبيانات */}
                <div className="w-full xl:w-[45%] flex flex-col items-center xl:items-start text-center xl:text-left">
                  <div className="relative mb-6 xl:mb-8">
                    <DocImage
                      src={doctor.image}
                      name={doctor.name}
                      className="w-32 h-32 md:w-40 md:h-40 xl:w-48 xl:h-48 rounded-full object-cover border-8 border-[#F8F9FA] dark:border-[#1E293B]"
                    />
                    <div className="absolute bottom-3 right-3 xl:bottom-5 xl:right-5 w-4 h-4 bg-[#DCEDE8] border-2 xl:border-3 border-[#079A6B] rounded-full"></div></div>

                  <h3 className="text-xl md:text-2xl font-bold text-black-main-text mb-1">{doctor.name}</h3>
                  <p className="text-brand-main font-semibold text-base md:text-lg mb-1">{doctor.role}</p>
                  <p className="text-gray-text-dim2 text-xs md:text-sm mb-4 xl:mb-6">{doctor.exp}</p>

                  <div className="flex items-center gap-4 xl:gap-6 mb-4">
                    <div className="flex items-center gap-1.5">
                      <HiStar className="text-[#F59E0B] size-5" />
                      <span className="font-bold text-black-main-text">{doctor.rating}</span>
                      <span className="text-gray-text-dim2 text-xs md:text-sm ml-1 flex items-center gap-1">
                        <FaUserGroup className="text-xs" /> {doctor.patients}
                      </span></div>
                  </div>

                  <div className="flex items-center gap-2 text-[#00C853] text-xs md:text-sm font-bold  px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
                    Available Now
                  </div>
                </div>

                {/* الجزء اليمين: الـ Metrics */}
                <div className="w-full xl:w-[50%] mt-8 xl:mt-0">
                  <div className="flex items-center justify-center xl:justify-start gap-2 text-black-main-text font-bold text-base md:text-lg mb-6 xl:mb-8">
                    <span className="text-brand-main"> <RiPulseLine className=" w-5 h-5 " />
                    </span>
                    Patient Metrics
                  </div>

                  <div className="space-y-4 xl:space-y-5 mb-8 xl:mb-10 w-full max-w-sm mx-auto xl:max-w-none">
                    {doctor.metrics.map((m, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800 pb-1.5 xl:pb-1">
                        <div className="flex items-center gap-3 text-gray-text-dim2 font-medium text-sm md:text-base">
                          <span style={{ color: m.color }} className="text-lg md:text-xl">{m.icon}</span>
                          {m.label}
                        </div>
                        <span className={`font-bold text-sm md:text-base ${m.isStatus ? 'text-[#00C853]' : 'text-black-main-text'}`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* ECG Box */}
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-700 p-4 xl:p-5 w-full max-w-sm mx-auto xl:max-w-none">
                    <div className="flex justify-between text-[10px] font-bold text-[#94A3B8] mb-3 tracking-widest uppercase">
                      <span>ECG Recording</span>
                      <span className="text-[#10B981] flex items-center gap-1">
                        LIVE
                      </span>
                    </div>
                    <div className="h-10 md:h-14">
                      <ECGAnimation />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* زرار اليمين - بيختفي لو إحنا في آخر صورة */}
          <button
            onClick={nextSlide}
            className={`hidden md:flex absolute top-1/2 -translate-y-1/2 w-[54px] h-[54px] bg-white dark:bg-[#111827] rounded-full items-center justify-center text-[#94a3b8] dark:text-gray-300 shadow-[0_10px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.45)] border border-[#f1f5f9] dark:border-gray-700 cursor-pointer z-30 transition-all duration-300 hover:bg-brand-main hover:text-white hover:shadow-[0_10px_20px_rgba(51,60,245,0.2)] right-[-20px] md:right-[-60px] ${currentIndex === doctors.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <HiChevronRight size={24} />
          </button>

          {/* Navigation for Mobile */}
          <div className="flex md:hidden items-center justify-center gap-6 mt-6">
            <button
              onClick={prevSlide}
              className={`w-10 h-10 bg-white dark:bg-[#111827] rounded-full flex items-center justify-center text-[#94a3b8] dark:text-gray-300 shadow-sm dark:shadow-none border border-[#f1f5f9] dark:border-gray-700 cursor-pointer transition-all duration-300 hover:bg-brand-main hover:text-white ${currentIndex === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            >
              <HiChevronLeft size={20} />
            </button>

            {/* Dots inside Mobile Navigation block */}
            <div className="flex justify-center gap-2">
              {doctors.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 transition-all duration-500 rounded-full cursor-pointer ${currentIndex === i ? 'w-4 bg-brand-main' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className={`w-10 h-10 bg-white dark:bg-[#111827] rounded-full flex items-center justify-center text-[#94a3b8] dark:text-gray-300 shadow-sm dark:shadow-none border border-[#f1f5f9] dark:border-gray-700 cursor-pointer transition-all duration-300 hover:bg-brand-main hover:text-white ${currentIndex === doctors.length - 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            >
              <HiChevronRight size={20} />
            </button>
          </div>

          {/* Dots for Desktop */}
          <div className="hidden md:flex justify-center gap-2.5 mt-10">
            {doctors.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 transition-all duration-500 rounded-full cursor-pointer ${currentIndex === i ? 'w-3 bg-brand-main' : 'w-2.5 bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

const ECGAnimation = () => (
  <svg viewBox="0 0 400 60" className="w-full h-full">
    <path
      d="M0 30 L60 30 L70 10 L80 50 L90 30 L180 30 L190 5 L200 55 L210 30 L300 30 L310 15 L320 45 L330 30 L400 30"
      fill="none"
      stroke="#10B981"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
        animation: 'drawECG 5s linear infinite',
      }}
    />
  </svg>
);

export default Doctors;