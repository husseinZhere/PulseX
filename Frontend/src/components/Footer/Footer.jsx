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
        <Link to="/register" className="px-7 py-4 rounded-full flex items-center gap-3 bg-gradient-to-r from-[#0913C3] to-[#FF0000] shadow-lg dark:shadow-none hover:shadow-2xl dark:shadow-none hover:scale-105 transition-all duration-300 group">
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
            {[
              { label: 'Home', href: '/#home' },
              { label: 'About', href: '/#about' },
              { label: 'Contact Us', href: 'mailto:support@pulseX.health' },
            ].map((item) => (
              <li key={item.label}>
                <a href={item.href} className="text-[16px] text-gray-text-dim2  hover:text-brand-main transition-colors font-medium">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <button className="bg-brand-main text-white px-6 py-3 rounded-full text-[14px] font-medium flex items-center gap-2 hover:bg-[#282eb5] transition-colors shadow-md dark:shadow-none group">
              <Link to="/register" className="flex items-center gap-2"> Get Started   <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></Link>

            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0] mb-6 font-display">Support</h4>
          <ul className="space-y-4">
            {['Documentation', 'Community'].map((item) => (
              <li key={item}>
                <span className="inline-flex items-center gap-2 text-[16px] text-gray-text-dim2 font-medium select-none">
                  {item}
                  <span className="rounded-full border border-gray-300 dark:border-gray-700 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Soon
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col max-w-7xl mx-auto px-4 md:flex-row justify-between items-end border-t border-gray-100 dark:border-gray-800 pt-8 gap-8">
        <div className="flex items-center gap-6">
          <a href="#" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main transition-colors"> <RiInstagramLine alt="PulseX" className="w-6 h-6 object-contain" /></a>
          <a href="#" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main transition-colors"> <FaLinkedin alt="PulseX" className="w-6 h-6 object-contain" /></a>
          <a href="#" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main transition-colors"> <FaFacebookF alt="PulseX" className="w-6 h-6 object-contain" /></a>
          <a href="#" className="text-black-main-text dark:text-[#E2E8F0] hover:text-brand-main transition-colors"> <FaXTwitter alt="PulseX" className="w-6 h-6 object-contain" /></a>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[16px] text-black-main-text dark:text-[#E2E8F0] font-medium">Email</span>
          <a href="mailto:support@pulseX.health" className="text-[16px] text-gray-text-dim2  hover:text-brand-main transition-colors flex items-center gap-2">
            <div className="w-4 h-4"> <HiOutlineMail className="w-4 h-4 object-contain" /></div>
            support@pulseX.health
          </a>
        </div>
      </div>

      <div className="mt-12 flex flex-col max-w-7xl mx-auto px-4 md:flex-row justify-between items-center text-[14px] text-gray-text-dim2 pt-8 border-t border-[#757575] dark:border-gray-700">

        <p>© 2025 PulseX. All rights reserved.</p>
        <div className="flex items-center gap-8 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>All systems operational</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
            <span>Version 2.1.0</span>
          </div>
        </div>
      </div>


    </footer></>
  );
};

export default Footer;