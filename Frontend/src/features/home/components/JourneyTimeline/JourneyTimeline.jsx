import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Container from '../HomeSectionWrapper/HomeSectionWrapper';

import {
  HiOutlineUserCircle, HiOutlineBolt, HiOutlineHeart,
  HiOutlineSparkles, HiOutlineQrCode, HiOutlineUsers,
  HiOutlineBell, HiOutlineCalendarDays, HiOutlineDocumentChartBar
} from "react-icons/hi2";
import { MdPersonAddAlt1 } from "react-icons/md";
import { CiWavePulse1 } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { BsBullseye } from "react-icons/bs";
import { GoPeople } from "react-icons/go";
const COLORS = {
  PRIMARY: "#333CF5",
  SECONDARY: "#0891B2",
  RED: "#DC2626",
  EMERALD: "#059669",
  AMBER: "#D97706",
  GRAY_BG: "#E5E7EB",
};

// البيانات كاملة كما أرسلتِها مع استبدال مسارات الصور بأيقونات برمجية
const TIMELINE_STEPS = [
  {
    title: "Sign Up & Profile",
    tag: "5 min",
    icon: <MdPersonAddAlt1 />,
    desc: "Create your account and complete your comprehensive health profile with medical history, current medications, and lifestyle factors.",
    side: "left",
    iconColor: COLORS.PRIMARY
  },
  {
    title: "Initial Assessment",
    tag: "2 min",
    icon: <CiWavePulse1 />,
    desc: "Our AI analyzes your data to establish baseline metrics and identify potential risk factors for personalized monitoring.",
    side: "right",
    iconColor: COLORS.SECONDARY
  },
  {
    title: "Risk Score Calculation",
    tag: "Instant",
    icon: <CiHeart />,
    desc: "Receive your personalized heart risk score based on advanced algorithms analyzing over 50 health parameters.",
    side: "left",
    iconColor: COLORS.RED
  },
  {
    title: "Lifestyle Recommendations",
    tag: "Ongoing",
    icon: <BsBullseye />,
    desc: "Get personalized diet, exercise, and lifestyle recommendations tailored to your specific risk profile and health goals.",
    side: "right",
    iconColor: COLORS.EMERALD
  },
  {
    title: "Emergency QR Setup",
    tag: "1 min",
    icon: <HiOutlineQrCode />,
    desc: "Generate your emergency QR code containing critical medical information for first responders and emergency situations.",
    side: "left",
    iconColor: COLORS.RED
  },
  {
    title: "Doctor Connection",
    tag: "24/7",
    icon: <HiOutlineUsers />,
    desc: "Connect with certified cardiologists for virtual consultations, expert advice, and professional medical guidance.",
    side: "right",
    iconColor: COLORS.AMBER
  },
  {
    title: "Smart Reminders",
    tag: "Custom",
    icon: <HiOutlineBell />,
    desc: "Receive intelligent reminders for medications, appointments, vital checks, and lifestyle activities to maintain optimal health.",
    side: "left",
    iconColor: COLORS.SECONDARY
  },
  {
    title: "Health Calendar",
    tag: "Organized",
    icon: <HiOutlineCalendarDays />,
    desc: "Keep track of your appointments, medication schedules, and health milestones in one integrated calendar view.",
    side: "right",
    iconColor: COLORS.PRIMARY
  },
  {
    title: "Progress Reports",
    tag: "Monthly",
    icon: <HiOutlineDocumentChartBar />,
    desc: "Access detailed health reports, trend analysis, and progress tracking to visualize your heart health journey over time.",
    side: "left",
    iconColor: COLORS.EMERALD
  }
];

const TimelineItem = ({ step, isFirst }) => {
  const isLeft = step.side === 'left';
  const itemRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start center", "center center"]
  });

  // Smooth and slower fill for the loading bar while scrolling.
  const progressValue = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const smoothProgressValue = useSpring(progressValue, {
    stiffness: 42,
    damping: 24,
    mass: 1.1,
  });
  const progressBarWidth = useTransform(smoothProgressValue, (value) => `${value}%`);

  return (
    <div ref={itemRef} className={` font-inter  relative flex flex-col md:flex-row items-start justify-between w-full ${isFirst ? 'mb-12' : 'mb-[120px]'} last:mb-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}>

      {/* الكارت */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-[46%]"
      >
        <div className="relative shadow-lg dark:shadow-[0_14px_35px_rgba(0,0,0,0.45)] bg-white dark:bg-[#0F172A] p-6 rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-[5px] border border-transparent dark:border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-black-main-text">{step.title}</h3>
            <span className="px-2 py-1 bg-gray-100 dark:bg-[#111827] dark:text-gray-300 rounded-lg text-sm font-medium">{step.tag}</span>
          </div>
          <p className="text-gray-text-dim2 leading-relaxed mb-10">{step.desc}</p>

          <div className="absolute bottom-6 left-6 right-6 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              style={{ width: progressBarWidth, background: `linear-gradient(to right, #FF0000, #2564EB)` }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* الأيقونة في المنتصف */}
      <div className="hidden md:block absolute left-1/2 top-0 z-10 -translate-x-1/2">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg border-[4px] border-white dark:border-[#0B1220] relative z-20 transition-all duration-500"
          style={{ backgroundColor: step.iconColor, color: 'white' }}
        >
          <span className="text-2xl">{step.icon}</span>
        </motion.div>
      </div>

      <div className="w-full md:w-[46%]"></div>
    </div>
  );
};

const JourneyTimeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="about" ref={containerRef} className="pt-24 pb-10 bg-[#FAFAFA] dark:bg-[#020617] overflow-hidden font-inter">
      <Container>
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-bold text-black-main-text mb-4">Your Heart Health Journey</h2>
          <p className="text-lg text-gray-text-dim2">A comprehensive pathway to better cardiovascular health with AI guidance</p>
        </motion.div>

        <div className="relative max-w-[1160px] mx-auto ">
          {/* الخط الزمني العمودي */}
          <div className="absolute shadow-lg left-1/2 -translate-x-1/2 top-[22px] bottom-0 w-1 bg-gray-200 dark:bg-gray-800 rounded-full hidden md:block overflow-hidden">
            <motion.div style={{ height: lineHeight }} className="w-full rounded-full origin-top bg-brand-main" />
          </div>

          <div className="relative z-10 pt-8">
            {TIMELINE_STEPS.map((step, idx) => (
              <TimelineItem key={idx} step={step} isFirst={idx === 0} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default JourneyTimeline;