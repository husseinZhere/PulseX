import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Container from '../HomeSectionWrapper/HomeSectionWrapper';

// الأيقونات
import {
  HiOutlineHeart,
  HiOutlineQrCode,
  HiOutlineBell,
  HiOutlineDocumentText
} from "react-icons/hi2";
import { LuVideo, LuSparkles } from "react-icons/lu";
import { RiPulseFill } from "react-icons/ri";

// الصور (تأكد من صحة المسارات لديك)
import RiskScore from "../../../../assets/Images/f1.png";
import QRCodes from "../../../../assets/Images/f2.png";
import Medication from "../../../../assets/Images/f3.png";
import Records from "../../../../assets/Images/f4.png";
import DoctorFollowups from "../../../../assets/Images/f5.png";

const FEATURES_DATA = [
  {
    id: 0,
    title: "Ai Heart Risk Score",
    description: "Advanced machine learning algorithms analyze your vital signs, lifestyle factors, and medical history to provide a comprehensive risk assessment with 95% accuracy.",
    accuracy: "95%",
    dataPoints: "50+",
    updates: "Real-time",
    icon: <HiOutlineHeart />,
    image: RiskScore,
    activeColor: "#2564EB"
  },
  {
    id: 1,
    title: "Emergency QR Codes",
    description: "Instant access to your complete medical profile for emergency responders. Critical information available in seconds when every moment counts.",
    accuracy: "Instant",
    dataPoints: "Global",
    updates: "24/7 Safe",
    icon: <HiOutlineQrCode />,
    image: QRCodes,
    activeColor: "#E94242"
  },
  {
    id: 2,
    title: "Medication Reminders",
    description: "Smart medication management with personalized reminders, drug interaction alerts, and adherence tracking to optimize your treatment plan.",
    accuracy: "98%",
    dataPoints: "Daily",
    updates: "Smart",
    icon: <HiOutlineBell />,
    image: Medication,
    activeColor: "#D0791D"
  },
  {
    id: 3,
    title: "Full Medical Records",
    description: "Comprehensive digital health records with secure cloud storage, easy sharing with healthcare providers, and complete medical history tracking.",
    accuracy: "Secure",
    dataPoints: "100%",
    updates: "Cloud Sync",
    icon: <HiOutlineDocumentText />,
    image: Records,
    activeColor: "#0891B2"
  },
  {
    id: 4,
    title: "Doctor Follow-ups",
    description: "Virtual consultations with certified cardiologists, regular check-ins, and personalized care plans tailored to your specific heart health needs.",
    accuracy: "Expert",
    dataPoints: "HD",
    updates: "Direct Chat",
    icon: <LuVideo />,
    image: DoctorFollowups,
    activeColor: "#13D486"
  }
];

const Features = () => {
  const [activeTab, setActiveTab] = useState(0);
  const current = FEATURES_DATA[activeTab];

  return (
    <section id="features" className="py-24 bg-[#FAFAFA] dark:bg-[#020617] overflow-hidden font-inter">
      <Container>
        {/* العناوين العلوية */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-[32px] md:text-4xl font-bold text-black-main-text mb-4">
            Comprehensive Heart Health Features
          </h2>
          <p className="text-gray-text-dim2 text-lg max-w-2xl mx-auto font-medium">
            Advanced AI-powered tools for complete cardiovascular monitoring and care
          </p>
        </motion.div>

        {/* الكارد الرئيسي */}
        <motion.div
          className="bg-white dark:bg-[#0F172A] rounded-[48px] relative shadow-[0_4px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)] border border-gray-50 dark:border-gray-800 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {/* محتوى الكارد */}
          <div className="grid lg:grid-cols-2 gap-8 md:gap-10 items-center p-6 md:p-16 pb-28 md:pb-32">

            {/* المحتوى النصي (يسار) */}
            <div className="flex flex-col order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div
                      className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-[#111827] border flex items-center justify-center text-xl md:text-2xl shadow-sm dark:shadow-none"
                      style={{ color: current.activeColor, borderColor: `${current.activeColor}33` }}
                    >
                      {current.icon}
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-black-main-text">{current.title}</h3>
                  </div>

                  <p className="text-gray-text-dim2 text-base md:text-lg leading-relaxed mb-6 md:mb-10 max-w-[500px]">
                    {current.description}
                  </p>

                  <div className="flex flex-wrap gap-6 md:gap-10 mb-8">
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-bold text-black-main-text">{current.accuracy}</span>
                      <span className="text-[12px] md:text-[14px] font-medium text-gray-text-dim2 tracking-wide mt-1">Accuracy</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-bold text-black-main-text">{current.dataPoints}</span>
                      <span className="text-[12px] md:text-[14px] font-medium text-gray-text-dim2 tracking-wide mt-1">Data points</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-bold text-black-main-text">{current.updates}</span>
                      <span className="text-[12px] md:text-[14px] font-medium text-gray-text-dim2 tracking-wide mt-1">Updates</span>
                    </div>
                  </div>

                  {/* Progress Bar - تم تكبير الارتفاع لـ h-2 */}
                  <div className="w-full max-w-[400px]">
                    <div className="flex justify-between text-[10px] md:text-[11px] font-bold  text-gray-text-dim2 mb-2 tracking-wider">
                      <span>Feature {activeTab + 1} of 5</span>
                      <span style={{ color: current.activeColor }}>{(activeTab + 1) * 20}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: current.activeColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(activeTab + 1) * 20}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* الجزء البصري (يمين) */}
            <div className="relative w-full overflow-hidden rounded-[24px] bg-[#f8fafc] dark:bg-[#111827] shadow-lg dark:shadow-[0_12px_35px_rgba(0,0,0,0.45)] order-1 lg:order-2" style={{ aspectRatio: '16/10' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTab}
                  src={current.image}
                  alt={current.title}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full object-cover block"
                />
              </AnimatePresence>

              <motion.div
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center z-20 text-2xl"
                style={{ color: current.activeColor }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <RiPulseFill />
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-4 w-10 h-10 flex items-center justify-center text-2xl text-[#F59E0B] z-20"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <LuSparkles />
              </motion.div>
            </div>
          </div>

          {/* التابات العائمة بالأسفل (داخل الكونتينر) */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2  -translate-x-1/2 w-full max-w-max px-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 px-4 py-3 md:py-4 bg-white/80 dark:bg-[#0B1220]/90 md:bg-transparent dark:md:bg-transparent backdrop-blur-md md:backdrop-blur-none rounded-full shadow-sm dark:shadow-[0_8px_20px_rgba(0,0,0,0.35)] md:shadow-none dark:md:shadow-none border border-transparent dark:border-gray-700">
              {FEATURES_DATA.map((feat, index) => {
                const isActive = activeTab === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className="group relative flex cursor-pointer items-center justify-center transition-all duration-300"
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl md:text-2xl transition-all duration-300 border border-[#E5E7EB] dark:border-gray-600"
                      style={{
                        backgroundColor: isActive ? feat.activeColor : "transparent",
                        color: isActive ? "white" : "#9CA3AF",
                        borderColor: isActive ? feat.activeColor : undefined,
                        boxShadow: isActive ? `0 4px 12px ${feat.activeColor}40 md:0 10px 20px ${feat.activeColor}40` : "none"
                      }}
                    >
                      {feat.icon}
                    </div>
                    {/* Tooltip تظهر عند الـ Hover */}
                    <span className="absolute -top-10 scale-0 lg:group-hover:scale-100 transition-transform bg-black dark:bg-[#020617] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap">
                      {feat.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default Features;