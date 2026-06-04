import React, { useEffect, useRef, useState } from 'react';
import Container from '../Container/Container';
import { FaRocket, FaArrowRight } from 'react-icons/fa';

import { HiOutlineMail } from "react-icons/hi";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { RiInstagramLine } from "react-icons/ri";
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo/logo.svg';
import { getStartedPath } from '../../utils/authNav';

const STATS = [
  { label: 'Success Rate', target: 95, suffix: '%' },
  { label: 'Patients Helped', target: 10, suffix: 'K+' },
  { label: 'Support Available', target: 24, suffix: '/7' },
  { label: 'Expert Doctors', target: 50, suffix: '+' },
];

const AnimatedStat = ({ target, suffix, label, shouldAnimate }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    let rafId;
    let startTime;
    const duration = 1400;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - ((1 - progress) ** 3);

      setValue(Math.round(target * eased));

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [shouldAnimate, target]);

  return (
    <div>
      <p className="text-2xl md:text-[32px] font-bold text-brand-main mb-1">{value}{suffix}</p>
      <p className="text-sm md:text-[15px] text-gray-text-dim2  font-medium">{label}</p>
    </div>
  );
};

const Footer = () => {
  const statsRef = useRef(null);
  const [shouldAnimateStats, setShouldAnimateStats] = useState(false);

  useEffect(() => {
    const element = statsRef.current;
    if (!element || shouldAnimateStats) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldAnimateStats(true);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldAnimateStats]);

  return (<>
    <footer className="pt-4 pb-8 border-t border-gray-100 dark:border-gray-800 relative overflow-hidden bg-[#FAFAFA] dark:bg-[#111827]">

      <div className="flex flex-col items-center relative z-10 font-inter px-4 pb-10 border-b border-gray-100 dark:border-gray-800">
        <Link to={getStartedPath()} className="px-7 py-4 rounded-full flex items-center gap-3 bg-gradient-to-r from-[#0913C3] to-[#FF0000] shadow-lg dark:shadow-none hover:shadow-2xl dark:shadow-none hover:scale-105 transition-all duration-300 group">
          <FaRocket className="w-5 h-5 text-white" />
          <span className="font-inter font-bold text-sm md:text-[16px] text-white tracking-wide">
            Start Your Journey Now
          </span>
          <FaArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="max-w-lg text-sm md:text-[15px] text-center text-gray-text-dim2 font-medium m-4 p-4">Join thousands of patients who have improved their heart health with Pulse AI</p>
        <div ref={statsRef} className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-20 text-center">
          {STATS.map((stat) => (
            <AnimatedStat
              key={stat.label}
              target={stat.target}
              suffix={stat.suffix}
              label={stat.label}
              shouldAnimate={shouldAnimateStats}
            />
          ))}
        </div>
      </div>

    </footer>
    <footer className="pt-12 pb-10 relative overflow-hidden bg-white dark:bg-[#111827] shadow-5xl dark:shadow-none">


      <div className="max-w-7xl mx-auto px-4 font-inter grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">

        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="PulseX" className="w-8 h-8 object-contain" />
            <span className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0] font-display tracking-tight">PulseX</span>
          </div>
          <p className="text-[16px] text-gray-text-dim2  leading-[1.6] max-w-[360px] font-inter">
            PulseX is revolutionizing cardiovascular care with advanced AI-powered monitoring, risk assessment, and personalized treatment recommendations for better heart health outcomes.
          </p>
          <p className="text-[16px] text-gray-text-dim2  font-medium italic">
            Empowering heart health through AI innovation
          </p>
        </div>

        <div className="hidden md:block md:col-span-1"></div>

        <div className="md:col-span-2">
          <h4 className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-6 font-display">Quick Links</h4>
          <ul className="space-y-4">
            <li><Link to="/" className="text-[16px] text-gray-text-dim2 hover:text-brand-main transition-colors font-medium">Home</Link></li>
            <li><Link to="/about" className="text-[16px] text-gray-text-dim2 hover:text-brand-main transition-colors font-medium">About PulseX</Link></li>
            <li><Link to="/contact" className="text-[16px] text-gray-text-dim2 hover:text-brand-main transition-colors font-medium">Contact Us</Link></li>
            <li><Link to="/emergency" className="text-[16px] text-gray-text-dim2 hover:text-red-500 transition-colors font-medium flex items-center gap-1.5">🚨 Cardiac Emergency</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-6 font-display">Support</h4>
          <ul className="space-y-4">
            <li><Link to="/faq" className="text-[16px] text-gray-text-dim2 hover:text-brand-main transition-colors font-medium">FAQ</Link></li>
            <li><Link to="/privacy" className="text-[16px] text-gray-text-dim2 hover:text-brand-main transition-colors font-medium">Privacy Policy</Link></li>
            <li><Link to="/login" className="text-[16px] text-gray-text-dim2 hover:text-brand-main transition-colors font-medium">Community</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col max-w-7xl mx-auto px-4 md:flex-row justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-8 gap-8">
        <div className="flex items-center gap-6">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main hover:scale-110 transition-all"> <RiInstagramLine className="w-6 h-6 object-contain" /></a>
          <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main hover:scale-110 transition-all"> <FaLinkedin className="w-6 h-6 object-contain" /></a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main hover:scale-110 transition-all"> <FaFacebookF className="w-6 h-6 object-contain" /></a>
          <a href="https://www.x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main hover:scale-110 transition-all"> <FaXTwitter className="w-6 h-6 object-contain" /></a>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[16px] text-black-main-text dark:text-[#E2E8F0] font-medium">Email</span>
          <a href="mailto:pulsex.system@gmail.com" className="text-[16px] text-gray-text-dim2  hover:text-brand-main transition-colors flex items-center gap-2">
            <div className="w-4 h-4"> <HiOutlineMail className="w-4 h-4 object-contain" /></div>
            pulsex.system@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-12 flex flex-col max-w-7xl mx-auto px-4 md:flex-row justify-between items-center text-[14px] text-gray-text-dim2 pt-8 border-t border-[#757575] dark:border-gray-700">

        <p>© 2026 PulseX. All rights reserved.</p>
      </div>


    </footer></>
  );
};

export default Footer;