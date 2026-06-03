import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MdFavorite, MdSmartToy, MdSecurity, MdPeople, MdMonitor,
  MdArrowForward, MdCheckCircle, MdScience, MdSchool,
} from 'react-icons/md';
import { FaHeartbeat, FaUserMd, FaBrain, FaShieldAlt } from 'react-icons/fa';
import logoImg from '../../../../assets/logo/logo.svg';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' } }),
};

const Section = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

const PILLARS = [
  {
    icon: <FaBrain className="w-7 h-7" />,
    color: 'from-blue-500 to-indigo-600',
    title: 'AI-Powered Diagnosis',
    desc: 'Advanced machine learning models analyze cardiac X-rays and lifestyle data to detect cardiomegaly and predict heart disease risk with clinical-grade accuracy.',
  },
  {
    icon: <FaUserMd className="w-7 h-7" />,
    color: 'from-rose-500 to-red-600',
    title: 'Doctor–Patient Bridge',
    desc: 'Seamless real-time communication between patients and cardiologists — book appointments, exchange messages, and conduct video consultations in one place.',
  },
  {
    icon: <FaShieldAlt className="w-7 h-7" />,
    color: 'from-emerald-500 to-teal-600',
    title: 'Secure Medical Records',
    desc: 'All health data, prescriptions, and medical records are stored securely with QR-code access for instant sharing between healthcare providers.',
  },
  {
    icon: <FaHeartbeat className="w-7 h-7" />,
    color: 'from-purple-500 to-violet-600',
    title: 'Continuous Monitoring',
    desc: 'Track vitals, heart risk scores, and health trends over time with intuitive dashboards designed for both patients and physicians.',
  },
];

const STEPS = [
  { num: '01', title: 'Create Your Account', desc: 'Register as a patient or doctor. Complete your health profile in minutes.', icon: <MdPeople size={22} /> },
  { num: '02', title: 'AI Risk Assessment', desc: 'Submit lifestyle data and cardiac X-rays. Our AI analyzes them instantly.', icon: <MdSmartToy size={22} /> },
  { num: '03', title: 'Connect with a Doctor', desc: 'Book a specialist, chat in real time, or join a video consultation.', icon: <MdFavorite size={22} /> },
  { num: '04', title: 'Monitor Your Health', desc: 'Track prescriptions, medical records, and heart health trends over time.', icon: <MdMonitor size={22} /> },
];

const TECH = [
  { label: 'React 18 + Vite', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { label: 'ASP.NET Core 8', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { label: 'FastAPI + Python', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  { label: 'TensorFlow / Keras', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { label: 'SignalR Real-time', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { label: 'SQL Server + EF Core', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300' },
  { label: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { label: 'DenseNet121 CNN', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#020617] font-inter">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0B1220] border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-main/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-red-500/10 to-transparent blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-main/10 dark:bg-brand-main/20 text-brand-main rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
          >
            <MdScience size={16} /> Graduation Research Project
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-black-main-text dark:text-white leading-tight mb-6"
          >
            Redefining{' '}
            <span className="bg-gradient-to-r from-brand-main to-red-500 bg-clip-text text-transparent">
              Cardiac Care
            </span>
            <br />with Artificial Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="text-lg md:text-xl text-gray-text-dim2 max-w-2xl mx-auto leading-relaxed mb-10"
          >
            PulseX is a full-stack medical platform that connects patients with cardiologists,
            powered by AI risk assessment, real-time communication, and smart health monitoring —
            all in one secure ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-brand-main text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#252CBF] transition-all hover:shadow-lg hover:shadow-brand-main/30 active:scale-95"
            >
              Get Started <MdArrowForward size={18} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-black-main-text dark:text-white px-8 py-3.5 rounded-full font-semibold hover:border-brand-main hover:text-brand-main transition-all"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Four Pillars ───────────────────────────────────────── */}
      <Section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black-main-text dark:text-white mb-4">
            Built on Four Pillars
          </h2>
          <p className="text-gray-text-dim2 max-w-xl mx-auto">
            Every feature in PulseX was designed around one goal: better cardiovascular outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              custom={i}
              variants={fadeUp}
              className="group bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 hover:shadow-xl dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                {p.icon}
              </div>
              <h3 className="text-xl font-bold text-black-main-text dark:text-white mb-3">{p.title}</h3>
              <p className="text-gray-text-dim2 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <Section className="bg-white dark:bg-[#0B1220] border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black-main-text dark:text-white mb-4">
              How PulseX Works
            </h2>
            <p className="text-gray-text-dim2 max-w-xl mx-auto">
              From registration to continuous monitoring — four simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-brand-main/30 via-brand-main to-red-500/30" />
            {STEPS.map((s, i) => (
              <motion.div key={s.num} custom={i} variants={fadeUp} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-brand-main to-[#2936D6] flex items-center justify-center text-white shadow-lg shadow-brand-main/30 mb-5">
                  <span className="text-xs font-bold absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px]">{s.num}</span>
                  {s.icon}
                </div>
                <h4 className="font-bold text-black-main-text dark:text-white mb-2">{s.title}</h4>
                <p className="text-sm text-gray-text-dim2 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Tech Stack ──────────────────────────────────────────── */}
      <Section className="max-w-5xl mx-auto px-6 py-24">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <MdScience size={16} /> Technology Stack
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black-main-text dark:text-white mb-4">
            Built with Modern Technologies
          </h2>
          <p className="text-gray-text-dim2 max-w-xl mx-auto">
            PulseX integrates cutting-edge frameworks across three independent services — Frontend, Backend API, and AI Service.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
          {TECH.map((t) => (
            <span key={t.label} className={`px-4 py-2 rounded-full text-sm font-semibold ${t.color}`}>
              {t.label}
            </span>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Frontend', port: '5173', desc: 'React 18 + Vite + Tailwind CSS + Framer Motion + SignalR client', icon: '⚛️' },
            { title: 'Backend API', port: '5245', desc: 'ASP.NET Core 8 · Entity Framework · SignalR Hubs · JWT Auth', icon: '⚙️' },
            { title: 'AI Service', port: '8001', desc: 'FastAPI · DenseNet121 X-ray CNN · Recommendation Engine · Chatbot', icon: '🧠' },
          ].map((s) => (
            <div key={s.title} className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-black-main-text dark:text-white">{s.title}</h4>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">:{s.port}</span>
              </div>
              <p className="text-sm text-gray-text-dim2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </motion.div>
      </Section>

      {/* ── Graduation Badge ────────────────────────────────────── */}
      <Section className="bg-gradient-to-br from-brand-main to-[#1a1f9e] dark:from-[#0d1150] dark:to-[#060c3b]">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <MdSchool size={16} /> Graduation Project 2026
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-white mb-5">
            A Vision for the Future of Cardiac Health
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            PulseX was developed as a graduation research project — combining clinical knowledge,
            full-stack engineering, and AI research to demonstrate how technology can transform
            preventive cardiovascular care.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-brand-main px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-all active:scale-95"
            >
              Try PulseX <MdArrowForward size={18} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </Section>

    </div>
  );
}
