import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../../../../utils/authNav';
import {
  MdPhone, MdWarning, MdCheckCircle, MdCancel,
  MdFavorite, MdArrowForward, MdLocalHospital, MdTimer,
} from 'react-icons/md';
import { FaHeartbeat, FaAmbulance, FaPhoneAlt } from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' } }),
};

const Section = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

const EMERGENCY_NUMBERS = [
  {
    number: '123',
    label: 'Ambulance',
    sublabel: 'Egyptian Ambulance Service',
    icon: <FaAmbulance size={22} />,
    color: 'from-red-500 to-rose-600',
    urgent: true,
  },
  {
    number: '137',
    label: 'Police',
    sublabel: 'Emergency Police Line',
    icon: <MdPhone size={22} />,
    color: 'from-blue-500 to-blue-700',
  },
  {
    number: '16000',
    label: 'Health Hotline',
    sublabel: 'Ministry of Health',
    icon: <MdLocalHospital size={22} />,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    number: '0800-888-0700',
    dialNumber: '08008880700',
    label: 'Medical Emergency',
    sublabel: 'Free Emergency Line',
    icon: <FaPhoneAlt size={20} />,
    color: 'from-purple-500 to-violet-600',
  },
];

const WARNING_SIGNS = [
  { sign: 'Chest pain or pressure', note: 'Often radiates to the left arm, jaw, or back' },
  { sign: 'Sudden shortness of breath', note: 'Even without physical exertion' },
  { sign: 'Cold sweats', note: 'Accompanied by pallor or clammy skin' },
  { sign: 'Nausea or severe dizziness', note: 'Unexplained and sudden onset' },
  { sign: 'Irregular heartbeat', note: 'Too fast, too slow, or fluttering sensation' },
  { sign: 'Fainting or loss of consciousness', note: 'Even brief — treat as an emergency' },
];

const FIRST_AID_STEPS = [
  {
    step: 1,
    title: 'Call 123 Immediately',
    desc: 'Call the ambulance and stay on the line. Clearly describe your location and the patient\'s symptoms. Do not hang up until instructed.',
    color: 'bg-red-500',
    icon: <FaAmbulance size={20} />,
  },
  {
    step: 2,
    title: 'Keep the Patient Still and Calm',
    desc: 'Help them sit or lie in a comfortable position. Do not let them walk or exert themselves. Loosen any tight clothing around the chest.',
    color: 'bg-orange-500',
    icon: <MdFavorite size={20} />,
  },
  {
    step: 3,
    title: 'Aspirin 300mg — If No Allergy',
    desc: 'If aspirin is available and the patient has no known allergy, give one tablet to chew (not swallow whole). This helps thin the blood during a cardiac event.',
    color: 'bg-amber-500',
    icon: <MdLocalHospital size={20} />,
  },
  {
    step: 4,
    title: 'Perform CPR If Unconscious',
    desc: 'If the patient loses consciousness and stops breathing, place both hands on the center of the chest and push hard and fast — 30 compressions at 100–120 per minute. Continue until paramedics arrive.',
    color: 'bg-brand-main',
    icon: <FaHeartbeat size={20} />,
  },
  {
    step: 5,
    title: 'Unlock the Door and Guide the Paramedics',
    desc: 'Unlock the building entrance and send someone to meet the ambulance at street level to guide them directly to the patient.',
    color: 'bg-emerald-500',
    icon: <MdTimer size={20} />,
  },
];

const DO_NOTS = [
  'Do not give the patient food or drink',
  'Do not leave the patient alone',
  'Do not let them drive',
  'Do not delay calling the ambulance',
  'Do not give more than one aspirin tablet',
  'Do not encourage physical activity',
];

export default function Emergency() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#020617] font-inter">

      {/* ── Urgent Hero ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-red-800 dark:from-red-900 dark:via-rose-900 dark:to-red-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-black/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-full mb-6 mx-auto"
          >
            <FaHeartbeat className="text-white w-10 h-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Cardiac Emergency Guide
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-white/80 text-lg max-w-xl mx-auto mb-3"
          >
            First-response guidance for cardiac emergencies in Egypt
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/60 text-sm max-w-lg mx-auto"
          >
            In a real emergency — call 123 immediately. This page provides first-aid guidance only
            and is not a substitute for professional medical care.
          </motion.p>
        </div>
      </div>

      {/* ── Emergency Numbers ────────────────────────────────────── */}
      <Section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div variants={fadeUp} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-black-main-text dark:text-white mb-2">
            Emergency Numbers in Egypt
          </h2>
          <p className="text-gray-text-dim2 text-sm">Tap any card to call directly</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EMERGENCY_NUMBERS.map((n, i) => (
            <motion.a
              key={n.number}
              href={`tel:${n.dialNumber ?? n.number}`}
              custom={i}
              variants={fadeUp}
              className={`relative group bg-gradient-to-br ${n.color} rounded-2xl p-6 text-white text-center hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer ${n.urgent ? 'ring-2 ring-red-300 dark:ring-red-700' : ''}`}
            >
              {n.urgent && (
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                  Priority
                </span>
              )}
              <div className="flex justify-center mb-3 opacity-90">{n.icon}</div>
              <p className="font-bold mb-1 leading-tight break-all text-2xl tracking-normal">
                {n.number}
              </p>
              <p className="font-semibold text-sm mt-1">{n.label}</p>
              <p className="text-white/70 text-xs">{n.sublabel}</p>
              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-white/80 group-hover:text-white transition-colors">
                <MdPhone size={14} /> Call Now
              </div>
            </motion.a>
          ))}
        </div>
      </Section>

      {/* ── Warning Signs ────────────────────────────────────────── */}
      <Section className="bg-white dark:bg-[#0B1220] border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
                <MdWarning size={16} /> Warning Signs
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-black-main-text dark:text-white mb-3">
                Symptoms of a Heart Attack
              </h2>
              <p className="text-gray-text-dim2 text-sm mb-8 leading-relaxed">
                If you or someone nearby experiences any of these symptoms — do not wait.
                The first minutes are critical. <strong>Call 123 immediately.</strong>
              </p>

              <div className="space-y-3">
                {WARNING_SIGNS.map((w, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                    <div>
                      <p className="font-semibold text-black-main-text dark:text-white text-sm">{w.sign}</p>
                      <p className="text-xs text-gray-text-dim2 mt-0.5">{w.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div variants={fadeUp} custom={1} className="md:w-72 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-brand-main to-[#1a1f9e] rounded-2xl p-6 text-white">
                <MdTimer className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Every Minute Counts</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  Each minute of delay during a cardiac event means approximately 2 million heart muscle cells lost. Fast action saves lives.
                </p>
                <a
                  href="tel:123"
                  className="flex items-center justify-center gap-2 bg-white text-brand-main font-bold py-3 rounded-xl hover:bg-gray-100 transition-all text-sm"
                >
                  <FaAmbulance /> Call 123 Now
                </a>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
                <p className="text-amber-800 dark:text-amber-300 font-bold text-sm mb-2">⚠️ Important Notice</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                  The information on this page is for basic first-aid guidance only. PulseX is not an emergency service. Always contact trained medical professionals.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ── First Aid Steps ──────────────────────────────────────── */}
      <Section className="max-w-4xl mx-auto px-6 py-16">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <MdCheckCircle size={16} /> First Aid Protocol
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-black-main-text dark:text-white mb-3">
            What To Do — Step by Step
          </h2>
          <p className="text-gray-text-dim2 text-sm max-w-lg mx-auto">
            Follow these steps in order until emergency services arrive
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-red-500 via-brand-main to-emerald-500 hidden md:block" />
          <div className="space-y-4">
            {FIRST_AID_STEPS.map((s, i) => (
              <motion.div key={s.step} custom={i} variants={fadeUp} className="flex gap-6 items-start">
                <div className={`relative z-10 shrink-0 w-12 h-12 ${s.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  {s.icon}
                </div>
                <div className="flex-1 bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Step {s.step}</span>
                  <h3 className="font-bold text-black-main-text dark:text-white mt-1 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-text-dim2 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Do NOT Do ────────────────────────────────────────────── */}
      <Section className="bg-white dark:bg-[#0B1220] border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <MdCancel size={16} /> Never Do This
            </div>
            <h2 className="text-2xl font-bold text-black-main-text dark:text-white">Things to Absolutely Avoid</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DO_NOTS.map((d, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3"
              >
                <MdCancel className="text-red-500 shrink-0 w-5 h-5" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">{d}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <Section className="max-w-4xl mx-auto px-6 py-14">
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-br from-brand-main to-[#1a1f9e] rounded-3xl p-10 text-center text-white"
        >
          <FaHeartbeat className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Prevention is Better Than Cure</h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
            Don't wait for a crisis. PulseX helps you monitor your heart health daily,
            connect with specialists, and understand your risk before it escalates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn() && (
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-main px-8 py-3.5 rounded-full font-bold hover:bg-gray-100 transition-all active:scale-95"
              >
                Get Started Free <MdArrowForward size={18} />
              </Link>
            )}
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </Section>

    </div>
  );
}
