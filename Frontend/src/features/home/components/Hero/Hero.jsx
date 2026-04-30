import React, { useEffect, useRef } from 'react';
import {
  HiOutlineArrowTrendingUp,
  HiOutlineChevronDown,
  HiOutlineBolt
} from "react-icons/hi2";
import { FiArrowRight } from "react-icons/fi";
import { IoShieldOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { RiPulseLine } from "react-icons/ri";
import { Link } from 'react-router-dom';
import './Hero.css';
const heartImg = '/image/HomeRightSide.svg';

const HERO_CONTENT = {
  title: "Pulse",
  highlight: "X",
  subtitle: "AI-powered cardiovascular health monitoring with real-time risk assessment and remote doctor consultations.",
  features: [
    "AI Heart Risk Score with 95% accuracy",
    "24/7 vital signs monitoring",
    "Emergency QR codes for instant access",
    "Remote doctor follow-ups"
  ]
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const Hero = () => {
  const visualRef = useRef(null);
  const frameRef = useRef(null);

  const targetRef = useRef({
    tiltX: 0,
    tiltY: 0,
    parallaxX: 0,
    parallaxY: 0,
    glowX: 50,
    glowY: 50,
    active: 0,
  });

  const currentRef = useRef({
    tiltX: 0,
    tiltY: 0,
    parallaxX: 0,
    parallaxY: 0,
    glowX: 50,
    glowY: 50,
    active: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const node = visualRef.current;
    if (!node) return undefined;

    const renderFrame = () => {
      const target = targetRef.current;
      const current = currentRef.current;

      const damping = 0.14;
      current.tiltX += (target.tiltX - current.tiltX) * damping;
      current.tiltY += (target.tiltY - current.tiltY) * damping;
      current.parallaxX += (target.parallaxX - current.parallaxX) * damping;
      current.parallaxY += (target.parallaxY - current.parallaxY) * damping;
      current.glowX += (target.glowX - current.glowX) * damping;
      current.glowY += (target.glowY - current.glowY) * damping;
      current.active += (target.active - current.active) * 0.18;

      node.style.setProperty('--hero-tilt-x', `${current.tiltX.toFixed(2)}deg`);
      node.style.setProperty('--hero-tilt-y', `${current.tiltY.toFixed(2)}deg`);

      node.style.setProperty('--hero-soft-x', `${(current.parallaxX * 0.56).toFixed(2)}px`);
      node.style.setProperty('--hero-soft-y', `${(current.parallaxY * 0.56).toFixed(2)}px`);

      node.style.setProperty('--hero-card-x', `${(current.parallaxX * 0.33).toFixed(2)}px`);
      node.style.setProperty('--hero-card-y', `${(current.parallaxY * 0.28).toFixed(2)}px`);
      node.style.setProperty('--hero-card-x-op', `${(current.parallaxX * -0.33).toFixed(2)}px`);
      node.style.setProperty('--hero-card-y-op', `${(current.parallaxY * -0.28).toFixed(2)}px`);
      node.style.setProperty('--hero-card-rot', `${(current.tiltY * 0.5).toFixed(2)}deg`);
      node.style.setProperty('--hero-card-rot-op', `${(current.tiltY * -0.5).toFixed(2)}deg`);

      node.style.setProperty('--hero-icon-x', `${(current.parallaxX * 0.46).toFixed(2)}px`);
      node.style.setProperty('--hero-icon-y', `${(current.parallaxY * 0.36).toFixed(2)}px`);
      node.style.setProperty('--hero-icon-x-op', `${(current.parallaxX * -0.46).toFixed(2)}px`);
      node.style.setProperty('--hero-icon-y-op', `${(current.parallaxY * -0.36).toFixed(2)}px`);

      node.style.setProperty('--hero-glow-x', `${current.glowX.toFixed(2)}%`);
      node.style.setProperty('--hero-glow-y', `${current.glowY.toFixed(2)}%`);
      node.style.setProperty('--hero-active', `${current.active.toFixed(3)}`);

      frameRef.current = window.requestAnimationFrame(renderFrame);
    };

    frameRef.current = window.requestAnimationFrame(renderFrame);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const moveByPointer = (clientX, clientY) => {
    const node = visualRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const xRatio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const yRatio = clamp((clientY - rect.top) / rect.height, 0, 1);
    const normX = (xRatio - 0.5) * 2;
    const normY = (yRatio - 0.5) * 2;

    const target = targetRef.current;
    target.tiltX = clamp(-normY * 8.5, -8.5, 8.5);
    target.tiltY = clamp(normX * 11.5, -11.5, 11.5);
    target.parallaxX = clamp(normX * 24, -24, 24);
    target.parallaxY = clamp(normY * 18, -18, 18);
    target.glowX = xRatio * 100;
    target.glowY = yRatio * 100;
    target.active = 1;
  };

  const handleVisualPointerMove = (event) => {
    moveByPointer(event.clientX, event.clientY);
  };

  const resetInteraction = () => {
    targetRef.current.tiltX = 0;
    targetRef.current.tiltY = 0;
    targetRef.current.parallaxX = 0;
    targetRef.current.parallaxY = 0;
    targetRef.current.active = 0;
  };

  return (
    <section id="home" className="hero-root font-inter relative bg-[#FAFAFA] dark:bg-[#020617] overflow-hidden min-h-[calc(100vh-82px)] flex items-center justify-center pt-16 pb-20">
      <div className="hero-cinematic-bg" aria-hidden="true">
        <span className="hero-orb hero-orb-1" />
        <span className="hero-orb hero-orb-2" />
        <span className="hero-orb hero-orb-3" />
        <span className="hero-noise" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 relative z-10">
        <div className="lg:grid lg:grid-cols-2 items-center gap-16">

          {/* الجانب الأيسر: دخول من الشمال */}
          <div className="z-10 relative flex flex-col justify-center animate-fade-left">
            <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold text-black-main-text mb-4 font-display tracking-tight leading-[1.1]">
              {HERO_CONTENT.title}<span className="hero-title-highlight text-5xl sm:text-6xl md:text-[64px]">{HERO_CONTENT.highlight}</span>
            </h1>

            <p className="hero-subtitle text-base sm:text-lg text-gray-text-dim2 font-normal mb-6 leading-relaxed max-w-[600px]">
              {HERO_CONTENT.subtitle}
            </p>

            <div className="space-y-3 mb-8">
              {HERO_CONTENT.features.map((item, i) => (
                <div
                  key={i}
                  className="hero-feature-row flex items-center gap-3 opacity-0 animate-fade-left"
                  style={{ animationDelay: `${0.3 + (i * 0.15)}s`, animationFillMode: 'forwards' }}
                >
                  <FaCheck className="text-[#55F1C4] w-5 h-5 flex-shrink-0" />
                  <span className="text-base sm:text-lg text-black-main-text font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="hero-cta w-[176px] h-[48px] text-[15px] rounded-full bg-brand-main hover:bg-[#282eb5] shadow-lg group flex items-center justify-center gap-2 text-white transition-all duration-300 font-bold"
            >
              Get Started <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* الجانب الأيمن: دخول من اليمين وحركات عائمة */}
          <div
            ref={visualRef}
            onPointerMove={handleVisualPointerMove}
            onMouseMove={handleVisualPointerMove}
            onPointerEnter={() => {
              targetRef.current.active = 1;
            }}
            onMouseEnter={() => {
              targetRef.current.active = 1;
            }}
            onPointerLeave={resetInteraction}
            onMouseLeave={resetInteraction}
            className="hero-visual relative h-[500px] w-full flex justify-center items-center opacity-0 animate-fade-right"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="hero-radar-halo" aria-hidden="true" />
            <div className="hero-heart-rings" aria-hidden="true">
              <span className="hero-ring hero-ring-1" />
              <span className="hero-ring hero-ring-2" />
            </div>

            {/* صورة القلب: نبض هادئ جداً */}
            <div className="hero-heart-interactive">
              <div className="hero-heart-shell relative z-10 w-full h-full">
                <img src={heartImg} alt="Heart Model" className="hero-heart-image w-full h-auto drop-shadow-2xl dark:drop-shadow-[0_18px_40px_rgba(2,6,23,0.8)]" />
                <div className="hero-heart-vessel-map" aria-hidden="true">
                  <svg className="hero-vessel-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    <g className="hero-vessel-static">
                      <path d="M49 10 C55 19, 57 30, 53 42 C48 57, 41 69, 33 84" />
                      <path d="M52 15 C63 24, 70 36, 73 50 C75 63, 71 76, 64 89" />
                      <path d="M45 28 C35 34, 29 45, 28 57 C27 68, 31 79, 40 88" />
                      <path d="M58 30 C66 38, 69 49, 67 60 C64 72, 57 82, 49 90" />
                    </g>
                    <g className="hero-vessel-pulse hero-vessel-pulse-a">
                      <path d="M49 10 C55 19, 57 30, 53 42 C48 57, 41 69, 33 84" />
                      <path d="M52 15 C63 24, 70 36, 73 50 C75 63, 71 76, 64 89" />
                    </g>
                    <g className="hero-vessel-pulse hero-vessel-pulse-b">
                      <path d="M45 28 C35 34, 29 45, 28 57 C27 68, 31 79, 40 88" />
                      <path d="M58 30 C66 38, 69 49, 67 60 C64 72, 57 82, 49 90" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            {/* أيقونات عائمة - كل واحدة بتأخير مختلف */}
            <div className="hero-icon-layer hero-icon-layer-a absolute top-[10%] right-[15%]">
              <RiPulseLine className="hero-signal-icon hero-icon-a w-5 h-5 text-[#2EEB83] opacity-90" />
            </div>

            <div className="hero-icon-layer hero-icon-layer-b absolute bottom-[20%] left-[10%]">
              <HiOutlineBolt className="hero-signal-icon hero-icon-b w-5 h-5 text-[#DBCC28]" />
            </div>

            <span className="hero-spark hero-spark-1" aria-hidden="true" />
            <span className="hero-spark hero-spark-2" aria-hidden="true" />

            {/* كارت BPM: يتحرك ببطء */}
            <div className="hero-card-layer hero-card-layer-bpm">
              <div className="floating-card hero-glass-card hero-card-bpm">
                <div className="flex items-center gap-1">
                  <div className="hero-live-dot w-2.5 h-2.5 bg-[#13D486] rounded-full "></div>
                  <p className="text-black-main-text font-bold">BPM: 72</p>
                </div>
                <p className="text-gray-text-dim2 text-[10px] font-bold tracking-widest ">Normal Range</p>
              </div>
            </div>

            {/* كارت Risk: يتحرك ببطء بتأخير مختلف */}
            <div className="hero-card-layer hero-card-layer-risk">
              <div className="floating-card hero-glass-card hero-card-risk">
                <div className="hero-shield-float absolute -top-6 -left-1 w-10 h-10 flex items-center justify-center">
                  <IoShieldOutline className="text-brand-main w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <HiOutlineArrowTrendingUp className="text-brand-main w-5 h-5" />
                  <p className="text-black-main-text font-bold text-base">Risk: Low</p>
                </div>
                <p className="text-gray-text-dim2 text-[10px] font-bold ">AI Assessment</p>
              </div>
            </div>
          </div>
        </div>

        {/* سكرول إنديكيتور */}
        <div className="hero-scroll-indicator font-inter absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer opacity-60">
          <span className="text-gray-text-dim2 text-xs  tracking-widest">Scroll to explore</span>
          <HiOutlineChevronDown className="w-5 h-5 text-[#757575] dark:text-gray-400" />
        </div>
      </div>
    </section>
  );
};

export default Hero;