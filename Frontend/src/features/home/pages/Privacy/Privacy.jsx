import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MdShield, MdEmail, MdArrowForward, MdCheckCircle } from 'react-icons/md';
import { FaLock, FaDatabase, FaUserShield, FaEye } from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
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

const PILLARS = [
  {
    icon: <FaLock className="w-6 h-6" />,
    color: 'bg-blue-500',
    title: 'Data Encryption',
    desc: 'All medical and personal data is transmitted over HTTPS. Passwords are stored using strong cryptographic hashing — never in plain text.',
  },
  {
    icon: <FaDatabase className="w-6 h-6" />,
    color: 'bg-emerald-500',
    title: 'Secure Storage',
    desc: 'Medical records and files are stored exclusively on PulseX private servers. No third party can access them under any circumstances.',
  },
  {
    icon: <FaUserShield className="w-6 h-6" />,
    color: 'bg-purple-500',
    title: 'Access Control',
    desc: 'Only the patient can share their medical records — via QR code only. Doctors can access patient data only after explicit patient consent.',
  },
  {
    icon: <FaEye className="w-6 h-6" />,
    color: 'bg-rose-500',
    title: 'No Third-Party Sharing',
    desc: 'PulseX does not sell, share, or transfer any personal or medical data to external organizations, advertisers, or research bodies.',
  },
];

const SECTIONS = [
  {
    title: '1. Data We Collect',
    content: [
      'Personal data: full name, email address, date of birth, gender.',
      'Health data: vital signs (blood pressure, heart rate, weight), lifestyle survey responses, AI risk assessment results.',
      'Medical records: files uploaded by the patient or doctor (PDFs, X-ray images).',
      'Usage data: session logs and page visits — without personal tracking or profiling.',
    ],
  },
  {
    title: '2. How We Use Your Data',
    content: [
      'To operate platform services: appointments, messaging, video calls, and medical records.',
      'To run AI analysis: cardiac risk scoring and chest X-ray classification.',
      'To communicate: sending appointment notifications and medical messages.',
      'We do not use your data for advertising or any external commercial purpose.',
    ],
  },
  {
    title: '3. Data Sharing',
    content: [
      'Approved doctors: can access your medical file only after you choose to work with them.',
      'We do not sell or share your data with any third parties, advertisers, or external researchers.',
      'In legally mandated cases only — and only after notifying you where permitted by law.',
    ],
  },
  {
    title: '4. Your Rights',
    content: [
      'Right of access: you may request a full copy of your data at any time.',
      'Right of rectification: you may correct any inaccurate information from your account settings.',
      'Right of deletion: you may request permanent deletion of your account and all associated data.',
      'Right to object: you may opt out of any non-essential data processing at any time.',
    ],
  },
  {
    title: '5. Data Retention',
    content: [
      'Medical records are retained for the duration your account remains active.',
      'After account deletion, all data is permanently erased within 30 days.',
      'Session data is automatically discarded when the browser tab is closed (SessionStorage).',
    ],
  },
  {
    title: '6. Security Measures',
    content: [
      'All connections are encrypted via TLS/HTTPS.',
      'Passwords are stored using strong hashing — even our team cannot view them.',
      'Medical records are accessible only via QR code — never exposed as open URLs.',
      'Sessions are isolated per browser tab to prevent any cross-session data leakage.',
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#020617] font-inter">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0B1220] border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-brand-main/8 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-5"
          >
            <MdShield size={16} /> Privacy Policy & Data Security
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-black-main-text dark:text-white mb-4"
          >
            Your Data,{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Your Control
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-text-dim2 text-base mb-4"
          >
            PulseX is built on trust. Here we explain in full detail what data we collect,
            why we collect it, and exactly how we protect it.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xs text-gray-400"
          >
            Last updated: May 2026
          </motion.p>
        </div>
      </div>

      {/* ── Security Pillars ─────────────────────────────────────── */}
      <Section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div variants={fadeUp} className="text-center mb-10">
          <h2 className="text-2xl font-bold text-black-main-text dark:text-white">How We Protect Your Data</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-center"
            >
              <div className={`w-12 h-12 ${p.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                {p.icon}
              </div>
              <h3 className="font-bold text-black-main-text dark:text-white text-sm mb-2">{p.title}</h3>
              <p className="text-xs text-gray-text-dim2 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Policy Sections ──────────────────────────────────────── */}
      <Section className="bg-white dark:bg-[#0B1220] border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
          {SECTIONS.map((sec, i) => (
            <motion.div key={i} custom={i} variants={fadeUp}>
              <h2 className="text-lg font-bold text-black-main-text dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                {sec.title}
              </h2>
              <ul className="space-y-3">
                {sec.content.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <MdCheckCircle className="text-emerald-500 shrink-0 w-5 h-5 mt-0.5" />
                    <span className="text-sm text-gray-text-dim2 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Contact + CTA ────────────────────────────────────────── */}
      <Section className="max-w-3xl mx-auto px-6 py-14">
        <motion.div variants={fadeUp} className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MdEmail className="text-emerald-600 dark:text-emerald-400 w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-black-main-text dark:text-white mb-2">
            Have a Privacy Question?
          </h2>
          <p className="text-gray-text-dim2 text-sm mb-4">
            Contact us directly and we'll respond within 24 hours.
          </p>
          <a
            href="mailto:pulsex.system@gmail.com"
            className="inline-flex items-center gap-2 text-brand-main font-semibold text-sm hover:underline"
          >
            pulsex.system@gmail.com
          </a>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-brand-main text-white px-7 py-3 rounded-full font-semibold hover:bg-[#252CBF] transition-all active:scale-95 text-sm"
            >
              Contact Us <MdArrowForward size={16} />
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-black-main-text dark:text-white px-7 py-3 rounded-full font-semibold hover:border-brand-main hover:text-brand-main transition-all text-sm"
            >
              View FAQ
            </Link>
          </div>
        </motion.div>
      </Section>

    </div>
  );
}
