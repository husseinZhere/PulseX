import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../../../../utils/authNav';
import { MdArrowForward, MdQuestionAnswer, MdSearch } from 'react-icons/md';
import { FaHeartbeat, FaUserMd, FaBrain, FaLock } from 'react-icons/fa';

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

const CATEGORIES = [
  { id: 'all', label: 'All', icon: <MdQuestionAnswer size={16} /> },
  { id: 'account', label: 'Account', icon: <FaUserMd size={14} /> },
  { id: 'ai', label: 'AI Features', icon: <FaBrain size={14} /> },
  { id: 'video', label: 'Video Call', icon: <FaHeartbeat size={14} /> },
  { id: 'privacy', label: 'Privacy', icon: <FaLock size={14} /> },
];

const FAQS = [
  {
    cat: 'account',
    q: 'How do I register on PulseX?',
    a: 'Click "Get Started" from any page. Enter your email address, full name, and a password. After registration you will receive a confirmation and can start immediately.',
  },
  {
    cat: 'account',
    q: 'Who can register on the platform?',
    a: 'Any patient can register directly as a Patient. Doctors are registered through the administration and their credentials are reviewed before activation.',
  },
  {
    cat: 'account',
    q: 'I forgot my password — what should I do?',
    a: 'Click "Forgot Password" on the login page. Enter your email and a reset link will be sent to you, valid for a limited time.',
  },
  {
    cat: 'ai',
    q: 'How does the AI work in PulseX?',
    a: 'PulseX uses two models: the first analyzes chest X-rays using a DenseNet121 CNN to detect Cardiomegaly (enlarged heart). The second calculates your heart disease risk score based on your health data and lifestyle survey.',
  },
  {
    cat: 'ai',
    q: 'Is the AI a replacement for a doctor?',
    a: 'No. AI results in PulseX are for informational and awareness purposes only — they are not a medical diagnosis. Always consult a qualified doctor for any medical decision. PulseX is a tool to help you make better-informed decisions, not a substitute for professional care.',
  },
  {
    cat: 'ai',
    q: 'How accurate is the cardiac X-ray model?',
    a: 'The model was trained on a large medical dataset and achieves high accuracy in detecting Cardiomegaly. However, any result must be interpreted by a doctor — the model is a decision-support tool, not a final diagnosis.',
  },
  {
    cat: 'video',
    q: 'How do I start a video call with my doctor?',
    a: 'Go to the "Messages" page, open the conversation with your doctor, and tap the video icon. Your doctor will receive an instant ring notification. Once they accept, the video meeting opens automatically in a new tab.',
  },
  {
    cat: 'video',
    q: 'What devices does the video call support?',
    a: 'It works on any modern browser (Chrome, Firefox, Edge, Safari). Chrome is recommended for the best experience. No downloads required — everything runs directly in the browser.',
  },
  {
    cat: 'privacy',
    q: 'How is my medical data kept secure?',
    a: 'All data is stored on secure private servers. Medical records are accessible via QR code only. No one can access your data except the doctors you have chosen to work with.',
  },
  {
    cat: 'privacy',
    q: 'Does PulseX sell my data to third parties?',
    a: 'Absolutely not. PulseX does not share any personal or medical data with external parties. Data is used solely to improve your experience within the platform.',
  },
];

const AccordionItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between px-6 py-5 text-left gap-4"
      >
        <span className="font-semibold text-black-main-text dark:text-white text-sm leading-relaxed">{faq.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-brand-main text-2xl font-light shrink-0 leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-gray-text-dim2 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-3">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter((f) => {
    const matchCat = activeCategory === 'all' || f.cat === activeCategory;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#020617] font-inter">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0B1220] border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-main/8 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-red-500/8 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-brand-main/10 dark:bg-brand-main/20 text-brand-main rounded-full px-4 py-1.5 text-sm font-semibold mb-5"
          >
            <MdQuestionAnswer size={16} /> Frequently Asked Questions
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-black-main-text dark:text-white mb-4"
          >
            How Can We{' '}
            <span className="bg-gradient-to-r from-brand-main to-red-500 bg-clip-text text-transparent">
              Help You?
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-text-dim2 text-base mb-8"
          >
            Quick answers to the most common questions our patients ask about PulseX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative max-w-md mx-auto"
          >
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-11 pr-4 py-3.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F172A] dark:text-white text-sm outline-none focus:border-brand-main focus:ring-2 focus:ring-brand-main/15 transition-all placeholder:text-gray-400"
            />
          </motion.div>
        </div>
      </div>

      {/* ── FAQ Content ──────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Section className="mb-8">
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand-main text-white shadow-md shadow-brand-main/25'
                    : 'bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-main hover:text-brand-main'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </motion.div>
        </Section>

        <Section className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div variants={fadeUp} className="text-center py-16">
              <MdQuestionAnswer className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-text-dim2">No results found for your search.</p>
            </motion.div>
          ) : (
            filtered.map((faq, i) => <AccordionItem key={i} faq={faq} index={i} />)
          )}
        </Section>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <Section className="bg-white dark:bg-[#0B1220] border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-2xl font-bold text-black-main-text dark:text-white mb-3">
              Didn't find your answer?
            </h2>
            <p className="text-gray-text-dim2 text-sm mb-6">
              Our team is ready to help — reach out directly and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-brand-main text-white px-7 py-3 rounded-full font-semibold hover:bg-[#252CBF] transition-all active:scale-95 text-sm"
              >
                Contact Us <MdArrowForward size={16} />
              </Link>
              {!isLoggedIn() && (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-black-main-text dark:text-white px-7 py-3 rounded-full font-semibold hover:border-brand-main hover:text-brand-main transition-all text-sm"
                >
                  Register for Free
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </Section>

    </div>
  );
}
