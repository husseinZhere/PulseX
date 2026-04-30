import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiBars3, HiXMark, HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import logoImg from '../../assets/logo/logo.svg';
import Button from './../../Button/Button';
import { FaArrowRight } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home'); // لمتابعة السيكشن الظاهر
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Doctors', href: '#doctors' },
    { label: 'Features', href: '#features' },
    { label: 'Stories', href: '#stories' },
    { label: 'About', href: '#about' },
  ];

  const NAV_HEIGHT = 82;
  const SCROLL_OFFSET = NAV_HEIGHT + 14;

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return false;

    const targetTop = section.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    return true;
  };

  const handleAnchorNavigation = (event, href) => {
    const sectionId = href.replace('#', '');
    const hasSection = scrollToSection(sectionId);
    if (!hasSection) return;

    event.preventDefault();
    setActiveSection(sectionId);
    setIsOpen(false);

    if (window.location.hash !== `#${sectionId}`) {
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  // 1. مراقبة الـ Scroll لتغيير شكل الـ Navbar (Shadow)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // 2. تحديد السيكشن النشط أثناء السكرول
      const sectionIds = ['home', 'features', 'doctors', 'stories', 'about'];
      const scrollPosition = window.scrollY + SCROLL_OFFSET + 10;
      let currentSection = sectionIds[0];

      sectionIds.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element &&
          scrollPosition >= element.offsetTop &&
          scrollPosition < element.offsetTop + element.offsetHeight) {
          currentSection = sectionId;
        }
      });

      setActiveSection((prev) => (prev === currentSection ? prev : currentSection));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionId = window.location.hash.replace('#', '');
    if (!sectionId) return;

    requestAnimationFrame(() => {
      if (scrollToSection(sectionId)) {
        setActiveSection(sectionId);
      }
    });
  }, []);

  return (
    <nav className={`h-[82px] sticky top-0 z-[100] flex items-center bg-white dark:bg-[#111827] transition-all duration-500 ${isScrolled ? 'shadow-md dark:shadow-none border-b border-gray-100 dark:border-gray-800' : 'shadow-sm dark:shadow-none'}`}>
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-[80px] flex justify-between items-center">

        {/* اللوجو */}
        <a href="#home" onClick={(event) => handleAnchorNavigation(event, '#home')} className="flex items-center gap-3 cursor-pointer z-[101]">
          <img src={logoImg} alt="Logo" className="w-[32px] h-[27px]" />
          <span className="font-inter font-bold text-[20px] text-black-main-text dark:text-[#E2E8F0]">
            Pulse<span className="text-brand-main">X</span>
          </span>
        </a>

        {/* لينكات الكمبيوتر - Anchor Links */}
        <div className="hidden md:flex items-center gap-[40px]">
          {navLinks.map((link) => {
            const sectionId = link.href.replace('#', '');
            const isActive = activeSection === sectionId;

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => handleAnchorNavigation(event, link.href)}
                className={`
                  relative font-inter text-[14px] font-medium transition-all duration-300 pb-1 group cursor-pointer
                  ${isActive ? 'text-brand-main' : 'text-gray-text-dim hover:text-brand-main'}
                  after:content-[''] after:absolute after:bottom-0 after:-left-2 after:-right-2 after:h-[2px] 
                  after:bg-brand-main after:transition-all after:duration-500
                  ${isActive ? 'after:scale-x-100' : 'after:scale-x-0 group-hover:after:scale-x-100'}
                `}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* الأزرار الثابتة (Login/Register تظل صفحات مستقلة) */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={toggleTheme} className="text-gray-500 hover:text-brand-main transition-colors cursor-pointer">
            {isDark ? <HiOutlineSun className="w-6 h-6" /> : <HiOutlineMoon className="w-6 h-6" />}
          </button>
          <div className="flex gap-3">
            <Button variant="outline" className="text-[#0F172A] font-semibold border-gray-300 hover:text-white">
              <Link to="/login" className="flex items-center gap-2">Login</Link>
            </Button>
            <Button variant="primary">
              <Link to="/register" className="flex items-center gap-2"> Get Started   <FaArrowRight className="w-2 h-2 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
          </div>
        </div>

        {/* زرار الموبايل */}
        <div className="md:hidden z-[101]">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 dark:text-gray-100 cursor-pointer p-2">
            {isOpen ? <HiXMark className="w-8 h-8" /> : <HiBars3 className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* قائمة الموبايل - تأثير الستارة */}
      <div className={`
        absolute top-[82px] left-0 w-full bg-white dark:bg-[#111827] shadow-2xl dark:shadow-none md:hidden overflow-hidden transition-all duration-500 ease-in-out z-[99] border-t border-gray-100 dark:border-gray-800
        grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
      `}>
        <div className="min-h-0">
          <div className="flex flex-col p-6 gap-5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleAnchorNavigation(event, link.href)}
                  className={`
                    font-semibold text-[16px] py-2 cursor-pointer transition-all duration-300
                    ${isActive ? 'text-brand-main translate-x-2' : 'text-gray-800 dark:text-gray-200 hover:text-brand-main hover:translate-x-2'}
                  `}
                >
                  {link.label}
                </a>
              );
            })}

            <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button onClick={toggleTheme} className="text-gray-900 dark:text-gray-100 cursor-pointer">
                {isDark ? <HiOutlineSun className="w-6 h-6" /> : <HiOutlineMoon className="w-6 h-6" />}
              </button>
            </div>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="text-center py-3.5 border-2 border-brand-main rounded-xl text-brand-main font-bold block w-full bg-white dark:bg-[#111827]"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="text-center py-3.5 bg-brand-main rounded-xl text-white font-bold block w-full shadow-lg dark:shadow-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;