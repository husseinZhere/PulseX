import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../../../utils/api';
import { isLoggedIn } from '../../../../utils/authNav';
import {
  MdEmail, MdSend, MdCheckCircle, MdArrowForward,
  MdHeadsetMic, MdQuestionAnswer,
} from 'react-icons/md';
import { FaXTwitter, FaLinkedin, FaInstagram, FaFacebookF } from 'react-icons/fa6';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' } }),
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

const FAQS = [
  {
    q: 'Is PulseX available for all patients?',
    a: 'Yes. Any patient can register, complete a health profile, and access AI risk assessment and doctor booking.',
  },
  {
    q: 'How does the AI cardiac X-ray analysis work?',
    a: 'We use a DenseNet121 deep learning model trained on chest X-ray datasets to detect cardiomegaly (enlarged heart) with high accuracy.',
  },
  {
    q: 'Is my medical data secure?',
    a: 'All data is stored securely. Medical records are accessed via QR code only and sessions are isolated per browser tab.',
  },
  {
    q: 'Can doctors and patients video call inside PulseX?',
    a: 'Yes. PulseX integrates Jitsi-based video calls triggered directly from the messaging system with real-time ring notifications.',
  },
];

const SOCIALS = [
  { icon: <FaInstagram size={20} />, label: 'Instagram', href: '#' },
  { icon: <FaLinkedin size={20} />, label: 'LinkedIn', href: '#' },
  { icon: <FaFacebookF size={20} />, label: 'Facebook', href: '#' },
  { icon: <FaXTwitter size={20} />, label: 'X (Twitter)', href: '#' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    setServerError('');
    try {
      await api.post('/api/Contact/send', {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Failed to send message. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#111827] dark:text-[#E2E8F0] text-sm transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
      errors[field]
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-gray-200 dark:border-gray-700 focus:border-brand-main focus:ring-2 focus:ring-brand-main/15'
    }`;

  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#020617] font-inter">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0B1220] border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-main/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-red-500/8 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-brand-main/10 dark:bg-brand-main/20 text-brand-main rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
          >
            <MdHeadsetMic size={16} /> We're here to help
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-black-main-text dark:text-white mb-4"
          >
            Get in{' '}
            <span className="bg-gradient-to-r from-brand-main to-red-500 bg-clip-text text-transparent">
              Touch
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-text-dim2 text-lg max-w-xl mx-auto"
          >
            Have a question about PulseX? Want to collaborate or report an issue?
            We'd love to hear from you.
          </motion.p>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-5 gap-12">

        {/* Contact Form */}
        <Section className="lg:col-span-3">
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-sm"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center"
                >
                  <MdCheckCircle className="text-emerald-500 w-10 h-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-black-main-text dark:text-white">Message Sent!</h3>
                <p className="text-gray-text-dim2 max-w-xs">
                  Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> as soon as possible.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-2 text-brand-main font-semibold hover:underline text-sm"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-black-main-text dark:text-white mb-1">Send a Message</h2>
                <p className="text-gray-text-dim2 text-sm mb-8">Fill in the form below and we'll respond within 24 hours.</p>

                {serverError && (
                  <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-black-main-text dark:text-[#E2E8F0] mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Dr. Ahmed Hassan"
                        className={inputCls('name')}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black-main-text dark:text-[#E2E8F0] mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={inputCls('email')}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black-main-text dark:text-[#E2E8F0] mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className={inputCls('subject')}
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black-main-text dark:text-[#E2E8F0] mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us more about your question or feedback..."
                      className={`${inputCls('message')} resize-none`}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.message
                        ? <p className="text-red-500 text-xs">{errors.message}</p>
                        : <span />
                      }
                      <span className="text-xs text-gray-400">{form.message.length} chars</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-main text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#252CBF] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-brand-main/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      <><MdSend size={18} /> Send Message</>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </Section>

        {/* Sidebar */}
        <Section className="lg:col-span-2 flex flex-col gap-6">

          {/* Contact Info */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl p-6"
          >
            <h3 className="font-bold text-black-main-text dark:text-white text-lg mb-5">Contact Information</h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-main/10 dark:bg-brand-main/20 rounded-xl flex items-center justify-center shrink-0">
                <MdEmail className="text-brand-main w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-black-main-text dark:text-white">Email Us</p>
                <a
                  href="mailto:pulsex.system@gmail.com"
                  className="text-sm text-brand-main hover:underline break-all"
                >
                  pulsex.system@gmail.com
                </a>
                <p className="text-xs text-gray-400 mt-0.5">We respond within 24 hours</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-black-main-text dark:text-white mb-3">Follow Us</p>
              <div className="flex gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-main hover:border-brand-main transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* New to PulseX? — only for visitors who aren't signed in */}
          {!isLoggedIn() && (
            <motion.div
              variants={fadeUp}
              custom={1}
              className="bg-gradient-to-br from-brand-main to-[#1a1f9e] rounded-2xl p-6 text-white"
            >
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-4">
                <MdQuestionAnswer size={20} />
              </div>
              <h3 className="font-bold text-lg mb-2">New to PulseX?</h3>
              <p className="text-white/70 text-sm mb-5 leading-relaxed">
                Create an account in minutes and start your AI-powered cardiac health journey today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-main px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-all"
              >
                Get Started <MdArrowForward size={16} />
              </Link>
            </motion.div>
          )}

        </Section>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <Section className="bg-white dark:bg-[#0B1220] border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black-main-text dark:text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-text-dim2">Quick answers to common questions about PulseX.</p>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="bg-[#FAFBFD] dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-black-main-text dark:text-white text-sm">{faq.q}</span>
                  <span className={`text-brand-main text-xl font-light transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm text-gray-text-dim2 leading-relaxed">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

    </div>
  );
}
