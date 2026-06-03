import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import { analyzeXRay, uploadEcgToAi } from '../../../../services/aiService';
import { saveAiRiskSnapshot } from '../../../../services/riskAssessmentService';
import { uploadMedicalRecord } from '../../../../services/medicalRecordService';
import { MdOutlineMonitorHeart } from 'react-icons/md';
import { LuCloudUpload, LuCircleCheck } from 'react-icons/lu';
import { HiOutlineXMark } from 'react-icons/hi2';
import { IoSearchOutline } from 'react-icons/io5';

const RISK_VARIANTS = {
  low: {
    level: 'low',
    percentage: 23,
    gauge: {
      from: '#10B981',
      to: '#10B981',
      iconColor: '#16A34A',
      iconBg: '#DCFCE7',
      badgeBg: '#F0FDF4',
      badgeText: '#00A63E',
      label: 'Low Risk'
    },
    panel: {
      border: '#B7E4CC',
      bg: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
      iconBg: '#16A34A',
      title: 'Great News! Low Risk Detected',
      subtitle: 'AI-Powered Recommendations to Maintain Your Heart Health',
      analysis:
        'Based on our advanced AI analysis of your uploaded medical data, your heart health appears to be in good condition. Your risk indicators are within normal ranges. Continue following these personalized recommendations to maintain your excellent cardiovascular health.',
      listTitle: 'Personalized Lifestyle Recommendations:',
      list: [
        'Maintain a balanced diet rich in fruits, vegetables, and whole grains',
        'Exercise for at least 30 minutes, 5 days a week',
        'Monitor your blood pressure regularly at home',
        'Reduce sodium intake to less than 2300mg per day',
        'Get 7-9 hours of quality sleep each night'
      ]
    }
  },
  medium: {
    level: 'medium',
    percentage: 43,
    gauge: {
      from: ' #F59E0B',
      to: '#F59E0B',
      iconColor: '#D97706',
      iconBg: '#FEF3C7',
      badgeBg: '#FEF3C7',
      badgeText: '#D08700',
      label: 'Medium Risk'
    },
    panel: {
      border: '#FFF085',
      bg: 'linear-gradient(135deg, #FEFCE8 0%, #FFF7ED 100%)',
      iconBg: '#D08700',
      title: 'Moderate Risk: Action Recommended',
      subtitle: 'AI-Powered Recommendations for Risk Reduction',
      analysis:
        'Based on our AI analysis of your medical data, we detected moderate cardiovascular risk indicators. This is a manageable condition that requires attention and lifestyle modifications. Following these AI-curated recommendations can help reduce your risk and improve your heart health significantly.',
      warningTitle: 'Important Notice',
      warningText:
        'We recommend scheduling a follow-up consultation with your healthcare provider within 2-4 weeks to discuss these findings and create a personalized treatment plan.',
      listTitle: 'AI-Recommended Action Plan:',
      list: [
        'Increase physical activity to 45+ mins daily',
        'Follow a heart-healthy Mediterranean diet',
        'Monitor blood pressure and cholesterol levels monthly',
        'Consider stress reduction techniques like meditation',
        'Limit alcohol consumption to moderate levels',
        'Schedule a follow-up consultation within 2-4 weeks',
        'Consider cardio rehabilitation program enrollment'
      ],
      ctaLabel: 'Find Doctors Near You'
    }
  },
  high: {
    level: 'high',
    percentage: 84,
    gauge: {
      from: '#E7000B',
      to: '#E7000B',
      iconColor: '#DC2626',
      iconBg: '#FEE2E2',
      badgeBg: '#FEE2E2',
      badgeText: '#DC2626',
      label: 'High Risk'
    },
    panel: {
      border: '#FFA2A2',
      bg: 'linear-gradient(135deg, #FEF2F2 0%, #FDF2F8 100%)',
      iconBg: '#DC2626',
      title: 'Critical Alert: Medical Consultation Recommended',
      subtitle: 'Immediate action is required based on AI analysis',
      analysis:
        'Based on our AI analysis of your uploaded medical data, we have detected indicators that require immediate attention. Your health is our priority; we have curated a list of top cardiologists available on PulseX to help you right now.',
      warningTitle: 'Urgent: Immediate Medical Attention Required',
      warningText:
        'Your AI assessment indicates high cardiovascular risk. Please consult with a cardiologist as soon as possible. If you experience chest pain, shortness of breath, or severe symptoms, call emergency services immediately.',
      listTitle: 'Immediate Action Steps:',
      list: [
        'Seek immediate medical consultation with a cardiologist',
        'Avoid strenuous physical activities until cleared by doctor',
        'Monitor symptoms closely (chest pain, shortness of breath)',
        'Keep emergency contact readily available',
        'Follow prescribed medication regimen strictly',
        'Consider advanced cardiac screening tests'
      ],
      ctaLabel: 'Find Doctors Now'
    }
  }
};

const getPanelIcon = (level) => {
  if (level === 'high') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.29 3.85999L1.82001 18C1.64538 18.3024 1.55279 18.6452 1.55153 18.9944C1.55027 19.3435 1.64038 19.687 1.81282 19.9907C1.98525 20.2943 2.23397 20.5477 2.53434 20.7257C2.83472 20.9037 3.17629 21 3.52501 21H20.475C20.8237 21 21.1653 20.9037 21.4657 20.7257C21.7661 20.5477 22.0148 20.2943 22.1872 19.9907C22.3596 19.687 22.4497 19.3435 22.4485 18.9944C22.4472 18.6452 22.3546 18.3024 22.18 18L13.71 3.85999C13.5337 3.5661 13.2843 3.32299 12.986 3.15416C12.6877 2.98532 12.351 2.89648 12.0083 2.89648C11.6655 2.89648 11.3288 2.98532 11.0305 3.15416C10.7322 3.32299 10.4828 3.5661 10.3065 3.85999H10.29Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (level === 'medium') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M25.6654 8.1665L15.7487 18.0832L9.91536 12.2498L2.33203 19.8332" stroke="white" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.668 8.1665H25.668V15.1665" stroke="white" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const getAdviceIcon = (level) => {
  const color = level === 'high' ? '#DC2626' : level === 'medium' ? '#D97706' : '#16A34A';

  if (level === 'high') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.29 3.85999L1.82001 18C1.64538 18.3024 1.55279 18.6452 1.55153 18.9944C1.55027 19.3435 1.64038 19.687 1.81282 19.9907C1.98525 20.2943 2.23397 20.5477 2.53434 20.7257C2.83472 20.9037 3.17629 21 3.52501 21H20.475C20.8237 21 21.1653 20.9037 21.4657 20.7257C21.7661 20.5477 22.0148 20.2943 22.1872 19.9907C22.3596 19.687 22.4497 19.3435 22.4485 18.9944C22.4472 18.6452 22.3546 18.3024 22.18 18L13.71 3.85999C13.5337 3.5661 13.2843 3.32299 12.986 3.15416C12.6877 2.98532 12.351 2.89648 12.0083 2.89648C11.6655 2.89648 11.3288 2.98532 11.0305 3.15416C10.7322 3.32299 10.4828 3.5661 10.3065 3.85999H10.29Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (level === 'medium') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18V22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.93 4.93L7.76 7.76" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.24 16.24L19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.93 19.07L7.76 16.24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.24 7.76L19.07 4.93" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const getGaugeBadgeIcon = (level, color) => {
  if (level === 'high') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.29 3.85999L1.82001 18C1.64538 18.3024 1.55279 18.6452 1.55153 18.9944C1.55027 19.3435 1.64038 19.687 1.81282 19.9907C1.98525 20.2943 2.23397 20.5477 2.53434 20.7257C2.83472 20.9037 3.17629 21 3.52501 21H20.475C20.8237 21 21.1653 20.9037 21.4657 20.7257C21.7661 20.5477 22.0148 20.2943 22.1872 19.9907C22.3596 19.687 22.4497 19.3435 22.4485 18.9944C22.4472 18.6452 22.3546 18.3024 22.18 18L13.71 3.85999C13.5337 3.5661 13.2843 3.32299 12.986 3.15416C12.6877 2.98532 12.351 2.89648 12.0083 2.89648C11.6655 2.89648 11.3288 2.98532 11.0305 3.15416C10.7322 3.32299 10.4828 3.5661 10.3065 3.85999H10.29Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (level === 'medium') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22 7L13.5 15.5L8.5 10.5L2 17" stroke="#D08700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7H22V13" stroke="#D08700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 13C20 18 16.5 20.5 12.34 21.95C12.1222 22.0238 11.8855 22.0202 11.67 21.94C7.5 20.5 4 18 4 13V5.99996C4 5.73474 4.10536 5.48039 4.29289 5.29285C4.48043 5.10532 4.73478 4.99996 5 4.99996C7 4.99996 9.5 3.79996 11.24 2.27996C11.4519 2.09896 11.7214 1.99951 12 1.99951C12.2786 1.99951 12.5481 2.09896 12.76 2.27996C14.51 3.80996 17 4.99996 19 4.99996C19.2652 4.99996 19.5196 5.10532 19.7071 5.29285C19.8946 5.48039 20 5.73474 20 5.99996V13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Upload Card ─── */
const UploadCard = ({ title, desc, Icon, onUpload, onViewResult, viewResultLabel, isViewLoading }) => {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setIsUploaded(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setIsUploaded(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
      setIsUploaded(true);
    } catch {
      setIsUploaded(true); // still mark uploaded so user can view result attempt
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4 p-6 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-main flex items-center justify-center shrink-0">
          <Icon className="text-white text-xl" />
        </div>
        <div>
          <p className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0]">{title}</p>
          <p className="text-[14px] text-gray-text-dim2 dark:text-gray-400">{desc}</p>
        </div>
      </div>

      <div
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border border-[#E5E7EB] dark:border-gray-700 rounded-xl bg-white dark:bg-[#0F172A] h-35 flex flex-col items-center justify-center cursor-pointer hover:border-brand-main transition"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
          style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #BEDBFF 100%)' }}
        >
          <LuCloudUpload className="text-[#155DFC] text-xl" />
        </div>
        <p className="text-xs text-[#364153] dark:text-gray-300">
          Drag & drop {title} files or{' '}
          <span className="text-[#155DFC] font-semibold cursor-pointer">Browse</span>
        </p>
        <p className="text-[10px] text-gray-text-dim2 dark:text-gray-400 mt-1">Supported formats: JPEG, PNG</p>
        <input type="file" ref={fileRef} hidden onChange={handleFile} accept="image/*,.pdf" />
      </div>

      {file && (
        <div className="flex items-center gap-3 bg-[#F9FAFB] dark:bg-[#1F2937] rounded-xl px-4 py-4 border border-[#E5E7EB] dark:border-gray-700 animate-fade-in-up">
          <div className="bg-[#DCFCE7] dark:bg-emerald-900/30 p-2 rounded-lg">
            <LuCircleCheck className="text-[#00A63E] text-lg shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-black-main-text dark:text-[#E2E8F0] truncate">{file.name}</p>
            <p className="text-[10px] text-gray-text-dim2">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); setIsUploaded(false); }}
            className="text-gray-400 cursor-pointer hover:text-red-500 transition"
          >
            <HiOutlineXMark className="text-base" />
          </button>
        </div>
      )}

      {!isUploaded ? (
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className={`w-full py-2.5 cursor-pointer rounded-xl text-sm font-semibold transition
            ${file && !uploading
              ? 'bg-brand-main text-white hover:bg-[#2730d4] shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      ) : (
        <button
          onClick={onViewResult}
          disabled={isViewLoading}
          className="w-full py-2.5 cursor-pointer rounded-xl text-sm font-semibold transition text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm animate-fade-in-up"
          style={{ background: 'linear-gradient(90deg, #0913C3 0%, #333CF5 100%)' }}
        >
          {isViewLoading ? 'Analyzing...' : viewResultLabel}
        </button>
      )}
    </div>
  );
};

/* ─── Gauge ─── */
const RiskGauge = ({ percentage = 84, gaugeConfig, level, isDark }) => {
  const clamp = Math.min(100, Math.max(0, percentage));
  const trackColor = isDark ? '#334155' : '#E5E7EB';
  const badgeBg = isDark
    ? level === 'high'
      ? 'rgba(127, 29, 29, 0.35)'
      : level === 'medium'
        ? 'rgba(146, 64, 14, 0.35)'
        : 'rgba(6, 95, 70, 0.35)'
    : gaugeConfig.badgeBg;
  const badgeBorderColor = isDark
    ? level === 'high'
      ? '#7F1D1D'
      : level === 'medium'
        ? '#92400E'
        : '#065F46'
    : gaugeConfig.badgeText;
  const badgeTextColor = isDark
    ? level === 'high'
      ? '#FCA5A5'
      : level === 'medium'
        ? '#FCD34D'
        : '#86EFAC'
    : gaugeConfig.badgeText;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <div className="relative w-45 h-25 sm:w-50 sm:h-27.5">
        <svg viewBox="0 0 180 100" className="w-full h-full" overflow="visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gaugeConfig.from} />
              <stop offset="100%" stopColor={gaugeConfig.to} />
            </linearGradient>
          </defs>
          <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke={trackColor} strokeWidth="14" strokeLinecap="round" />
          <path
            d="M 10 90 A 80 80 0 0 1 170 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(clamp / 100) * 251.2} 251.2`}
            className="transition-all duration-1000 delay-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-2xl font-bold text-black-main-text dark:text-[#E2E8F0]">{clamp}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-[10px] border" style={{ background: badgeBg, borderColor: badgeBorderColor }}>
        {getGaugeBadgeIcon(level, badgeTextColor)}
        <span className="text-sm font-normal" style={{ color: badgeTextColor }}>
          {gaugeConfig.label}
        </span>
      </div>
    </div>
  );
};

/* ─── Result Details Panel ─── */
const RiskDetailsPanel = ({ result, onFindDoctors, isDark }) => {
  const { panel, level } = result;
  const isAlertLevel = level === 'high' || level === 'medium';
  const panelBackground = isDark
    ? level === 'high'
      ? 'linear-gradient(135deg, #3B0A0A 0%, #1E293B 100%)'
      : level === 'medium'
        ? 'linear-gradient(135deg, #2E2612 0%, #1E293B 100%)'
        : 'linear-gradient(135deg, #052E2B 0%, #0F172A 100%)'
    : panel.bg;
  const panelBorderColor = isDark
    ? level === 'high'
      ? '#7F1D1D'
      : level === 'medium'
        ? '#92400E'
        : '#065F46'
    : panel.border;
  const headerTextColor = isDark ? '#E2E8F0' : level === 'high' ? '#82181A' : '#101828';
  const subtitleTextColor = isDark ? '#CBD5E1' : level === 'high' ? '#C10007' : '#4A5565';
  const summaryIconColor = isDark
    ? level === 'high' ? '#FCA5A5' : level === 'medium' ? '#FCD34D' : '#86EFAC'
    : level === 'high' ? '#E7000B' : level === 'medium' ? '#D08700' : '#00A63E';
  const warningBorderColor = isDark
    ? level === 'high' ? '#7F1D1D' : '#92400E'
    : level === 'high' ? '#FFA2A2' : '#FFDF20';
  const warningBgColor = isDark
    ? level === 'high' ? 'rgba(127, 29, 29, 0.28)' : 'rgba(146, 64, 14, 0.28)'
    : level === 'high' ? '#FFE2E2' : '#FEF9C2';
  const warningTitleColor = isDark
    ? level === 'high' ? '#FCA5A5' : '#FCD34D'
    : level === 'high' ? '#B91C1C' : '#733E0A';
  const warningTextColor = isDark ? '#E2E8F0' : level === 'high' ? '#9F0712' : '#894B00';
  const warningIconColor = isDark
    ? level === 'high' ? '#FCA5A5' : '#FCD34D'
    : level === 'high' ? '#C10007' : '#A65F00';

  return (
    <div className="w-full rounded-2xl p-4 sm:p-6 border-2" style={{ borderColor: panelBorderColor, background: panelBackground }}>
      <div className="mb-4 flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
        <div className="w-full flex justify-center sm:w-auto sm:block">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: panel.iconBg }}>
            {getPanelIcon(level)}
          </div>
        </div>
        <div className="w-full text-center sm:text-left">
          <h3 className="text-xl font-bold" style={{ color: headerTextColor }}>{panel.title}</h3>
          <p className="text-base" style={{ color: subtitleTextColor }}>{panel.subtitle}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-[#0F172A]/80 p-4 border border-white/70 dark:border-gray-700 mb-4">
        <p className="relative text-lg font-semibold text-black-main-text dark:text-[#E2E8F0] mb-2 flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left pt-7 sm:pt-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="absolute left-1/2 top-0 -translate-x-1/2 sm:static sm:translate-x-0">
            <path d="M8.28086 12.9167C8.20647 12.6283 8.05615 12.3651 7.84555 12.1545C7.63494 11.9439 7.37176 11.7936 7.08336 11.7192L1.97086 10.4009C1.88364 10.3761 1.80687 10.3236 1.75221 10.2512C1.69754 10.1789 1.66797 10.0907 1.66797 10C1.66797 9.90937 1.69754 9.82118 1.75221 9.74884C1.80687 9.6765 1.88364 9.62397 1.97086 9.59921L7.08336 8.28004C7.37166 8.20572 7.63477 8.05552 7.84537 7.84508C8.05596 7.63463 8.20634 7.37162 8.28086 7.08338L9.5992 1.97088C9.6237 1.88331 9.67618 1.80616 9.74863 1.75121C9.82108 1.69625 9.90951 1.6665 10.0004 1.6665C10.0914 1.6665 10.1798 1.69625 10.2523 1.75121C10.3247 1.80616 10.3772 1.88331 10.4017 1.97088L11.7192 7.08338C11.7936 7.37177 11.9439 7.63496 12.1545 7.84556C12.3651 8.05616 12.6283 8.20648 12.9167 8.28088L18.0292 9.59838C18.1171 9.62263 18.1946 9.67505 18.2499 9.74761C18.3052 9.82016 18.3351 9.90884 18.3351 10C18.3351 10.0912 18.3052 10.1799 18.2499 10.2525C18.1946 10.325 18.1171 10.3775 18.0292 10.4017L12.9167 11.7192C12.6283 11.7936 12.3651 11.9439 12.1545 12.1545C11.9439 12.3651 11.7936 12.6283 11.7192 12.9167L10.4009 18.0292C10.3764 18.1168 10.3239 18.1939 10.2514 18.2489C10.179 18.3038 10.0905 18.3336 9.99961 18.3336C9.90868 18.3336 9.82025 18.3038 9.7478 18.2489C9.67535 18.1939 9.62287 18.1168 9.59836 18.0292L8.28086 12.9167Z" stroke={summaryIconColor} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.668 2.5V5.83333" stroke={summaryIconColor} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.3333 4.1665H15" stroke={summaryIconColor} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.33203 14.1665V15.8332" stroke={summaryIconColor} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.16667 15H2.5" stroke={summaryIconColor} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>AI Analysis Summary</span>
        </p>
        <p className="text-base text-[#364153] dark:text-gray-300 leading-relaxed">{panel.analysis}</p>
      </div>

      {isAlertLevel && panel.warningTitle && (
        <div
          className="rounded-xl p-4 pt-10 sm:pt-4 border mb-4 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 relative"
          style={{ borderColor: warningBorderColor, background: warningBgColor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute left-1/2 top-3 -translate-x-1/2 shrink-0 sm:static sm:translate-x-0 sm:mt-0.5" aria-hidden="true">
            <path d="M21.7285 18.0002L13.7285 4.00022C13.554 3.69243 13.3011 3.43641 12.9954 3.25829C12.6897 3.08017 12.3423 2.98633 11.9885 2.98633C11.6347 2.98633 11.2872 3.08017 10.9815 3.25829C10.6759 3.43641 10.4229 3.69243 10.2485 4.00022L2.24846 18.0002C2.07215 18.3056 1.97969 18.6521 1.98047 19.0047C1.98125 19.3573 2.07524 19.7035 2.25291 20.008C2.43058 20.3126 2.68561 20.5648 2.99216 20.7391C3.29871 20.9133 3.64587 21.0034 3.99846 21.0002H19.9985C20.3494 20.9999 20.694 20.9072 20.9977 20.7315C21.3015 20.5558 21.5537 20.3033 21.729 19.9993C21.9043 19.6954 21.9965 19.3506 21.9964 18.9997C21.9963 18.6488 21.9039 18.3041 21.7285 18.0002Z" stroke={warningIconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9V13" stroke={warningIconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 17H12.01" stroke={warningIconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="w-full text-center sm:text-left">
            <p className="text-base font-semibold mb-1" style={{ color: warningTitleColor }}>{panel.warningTitle}</p>
            <p className="text-base leading-relaxed" style={{ color: warningTextColor }}>{panel.warningText}</p>
          </div>
        </div>
      )}

      <p className="text-lg font-semibold text-black-main-text dark:text-[#E2E8F0] mb-3">{panel.listTitle}</p>
      <div className="space-y-2.5 sm:space-y-3">
        {panel.list.map((item, idx) => {
          const iconBgColor = level === 'high' ? '#FEE2E2' : level === 'medium' ? '#FEF9C2' : '#DCFCE7';
          const iconTextColor = level === 'high' ? '#DC2626' : level === 'medium' ? '#A65F00' : '#16A34A';
          return (
            <div key={idx} className="rounded-xl bg-white/80 dark:bg-[#0F172A]/70 border border-white/70 dark:border-gray-700 p-3 sm:p-3.5 transition-all relative pt-9 sm:pt-3.5 block sm:flex sm:items-start sm:gap-3.5">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 absolute left-1/2 top-2 -translate-x-1/2 sm:static sm:translate-x-0"
                style={{ background: iconBgColor, color: iconTextColor }}
              >
                {level === 'medium' ? (
                  <span className="text-[12px] sm:text-[14px] font-bold">{idx + 1}</span>
                ) : (
                  getAdviceIcon(level)
                )}
              </div>
              <p className="text-[14px] sm:text-[16px] text-[#364153] dark:text-gray-300 leading-relaxed flex-1 text-center sm:text-left">{item}</p>
            </div>
          );
        })}
      </div>

      {panel.ctaLabel && (
        <div className="flex justify-center mt-5 px-1 sm:px-0">
          <button
            onClick={onFindDoctors}
            className="flex items-center justify-center gap-2 px-5 py-2.5 cursor-pointer text-white text-lg font-bold transition whitespace-nowrap"
            style={{
              background: level === 'high'
                ? 'linear-gradient(90deg, #E7000B 0%, #C10007 100%)'
                : 'linear-gradient(90deg, #D08700 0%, #F54900 100%)',
              boxShadow: level === 'high'
                ? '0 25px 50px -12px rgba(251, 44, 54, 0.50)'
                : '0 10px 15px -3px rgba(240, 177, 0, 0.30), 0 4px 6px -4px rgba(240, 177, 0, 0.30)',
              borderRadius: level === 'high' ? '10px' : '16px'
            }}
          >
            <IoSearchOutline className="text-lg" /> {panel.ctaLabel}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── ECG Success Card ─── */
const EcgSuccessCard = () => (
  <div className="w-full rounded-2xl p-5 sm:p-6 border-2 border-[#B7E4CC] animate-fade-in-up"
    style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)' }}>
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#16A34A' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-[#101828]">ECG Uploaded Successfully</h3>
        <p className="text-base text-[#4A5565] mt-1">
          Your ECG file has been received and stored. A medical professional will review your ECG data during your next consultation.
        </p>
      </div>
    </div>
    <div className="mt-4 rounded-xl bg-white/80 border border-[#B7E4CC] p-4">
      <p className="text-sm text-[#364153] leading-relaxed">
        <span className="font-semibold text-[#16A34A]">Note:</span> ECG analysis requires clinical interpretation by a qualified cardiologist. Automated AI analysis for ECG is not available at this time. Your ECG result will be discussed during your appointment.
      </p>
    </div>
  </div>
);

/* ─── Main Page ─── */
const PatientHeartRisk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const [ecgShowResult, setEcgShowResult] = useState(false);
  const [ecgSaveError, setEcgSaveError] = useState('');

  const [xrayFile, setXrayFile] = useState(null);
  const [xrayAnalyzing, setXrayAnalyzing] = useState(false);
  const [xrayResult, setXrayResult] = useState(null);
  const [xrayShowResult, setXrayShowResult] = useState(false);
  const [xrayError, setXrayError] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains('dark'));
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const mapXRayToRisk = (result) => {
    if (!result) return RISK_VARIANTS.low;

    const level = (result.riskLevel || '').toLowerCase();
    const confidencePct = Math.round(result.confidence || 0);

    // Derive a risk percentage (higher number = more risk).
    // finding_probabilities contains the actual probability per finding (e.g. { Cardiomegaly: 8 }).
    // Using its max is the most intuitive display: low cardiomegaly prob → low gauge.
    let riskPct = null;
    if (result.finding_probabilities && typeof result.finding_probabilities === 'object') {
      const vals = Object.values(result.finding_probabilities).filter(v => typeof v === 'number');
      if (vals.length > 0) riskPct = Math.round(Math.max(...vals));
    }
    // Binary fallback mode returns { probabilities: { normal, abnormal } }
    if (riskPct == null && typeof result.probabilities?.abnormal === 'number') {
      riskPct = Math.round(result.probabilities.abnormal);
    }
    // Last resort: invert confidence for low-risk cases so gauge reads low
    if (riskPct == null) {
      riskPct = (level === 'low') ? Math.max(5, 100 - confidencePct) : confidencePct;
    }

    if (level === 'critical' || level === 'high') {
      return { ...RISK_VARIANTS.high, percentage: riskPct || RISK_VARIANTS.high.percentage };
    }
    if (level === 'medium') {
      return { ...RISK_VARIANTS.medium, percentage: riskPct || RISK_VARIANTS.medium.percentage };
    }
    return { ...RISK_VARIANTS.low, percentage: riskPct || RISK_VARIANTS.low.percentage };
  };

  const handleEcgUpload = async (file) => {
    setEcgSaveError('');
    // AI upload is non-critical — fire in background and ignore failure
    uploadEcgToAi(file).catch(() => {});
    // Medical record upload is critical — must succeed
    try {
      await uploadMedicalRecord('ECG', file, 'Uploaded from Heart Risk Assessment');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not save ECG to medical records.';
      setEcgSaveError(msg);
      console.error('ECG medical record save failed:', err?.response?.data ?? err);
      throw err; // re-throw so UploadCard knows the upload failed
    }
  };

  const handleXrayUpload = async (file) => {
    setXrayFile(file);
    setXrayResult(null);
    setXrayShowResult(false);
    setXrayError('');
  };

  const handleViewEcgResult = () => {
    setEcgShowResult(true);
  };

  const handleViewXrayResult = async () => {
    if (!xrayFile) return;
    setXrayError('');
    setXrayAnalyzing(true);
    try {
      const resp = await analyzeXRay(xrayFile);
      const rawResult = resp?.result ?? resp;
      if (!rawResult) {
        setXrayError(resp?.error || resp?.detail || 'Analysis failed. Please try again.');
        return;
      }
      const risk = mapXRayToRisk(rawResult);
      setXrayResult(risk);
      setXrayShowResult(true);
      // Persist result locally so dashboard health summary reflects it immediately
      const riskLevelFormatted = risk.level.charAt(0).toUpperCase() + risk.level.slice(1) + ' Risk';
      try {
        const xrayKey = user?.userId ? `pulsex_xray_risk_${user.userId}` : null;
        if (xrayKey) {
          localStorage.setItem(xrayKey, JSON.stringify({
            score: risk.percentage,
            level: riskLevelFormatted,
            summary: risk.panel.analysis,
            recommendations: risk.panel.list,
          }));
        }
      } catch { /* ignore storage errors */ }
      try {
        await saveAiRiskSnapshot({
          score: risk.percentage,
          level: riskLevelFormatted,
          summary: risk.panel.analysis,
          recommendations: risk.panel.list,
        });
      } catch (saveError) {
        console.error('Saving AI risk result failed', saveError);
        setXrayError('Result is shown, but could not sync it to your doctor yet. Please try again.');
      }
    } catch (err) {
      setXrayError(
        err?.response?.data?.detail || err?.message || 'Analysis failed. Please try again.'
      );
    } finally {
      setXrayAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out both; }
        .delay-gauge { animation-delay: 0.3s; }
        .delay-alert { animation-delay: 0.7s; }
      `}</style>

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M23.3281 23.333L29.3281 29.333" className="stroke-black-main-text dark:stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26.6641 14.6665C26.6641 11.4839 25.3998 8.43166 23.1493 6.18122C20.8989 3.93079 17.8467 2.6665 14.6641 2.6665C11.4815 2.6665 8.42922 3.93079 6.17878 6.18122C3.92834 8.43166 2.66406 11.4839 2.66406 14.6665C2.66406 17.8491 3.92834 20.9013 6.17878 23.1518C8.42922 25.4022 11.4815 26.6665 14.6641 26.6665C17.8467 26.6665 20.8989 25.4022 23.1493 23.1518C25.3998 20.9013 26.6641 17.8491 26.6641 14.6665Z" className="stroke-black-main-text dark:stroke-white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8.66406 18.6665L11.1201 11.2985C11.1817 11.1146 11.2996 10.9548 11.457 10.8415C11.6144 10.7283 11.8035 10.6673 11.9974 10.6673C12.1913 10.6673 12.3804 10.7283 12.5378 10.8415C12.6952 10.9548 12.8131 11.1146 12.8747 11.2985L15.3307 18.6665M19.3307 10.6665V18.6665M9.9974 15.9998H13.9974" className="stroke-black-main-text dark:stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">Heart Risk Assessment</h1>
        </div>
        <p className="text-[18px] text-gray-text-dim2 dark:text-gray-400">Upload and view your medical health easily.</p>
      </div>

      {/* ── Upload Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <UploadCard
          title="ECG"
          desc="Keep track of your latest ECG results (Optional)."
          Icon={() => (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="25" viewBox="0 0 28 25" fill="none">
              <path d="M0 9.3333V2.66666C0 1.93333 0.26133 1.30577 0.784 0.784C1.30666 0.26222 1.93422 0.00088 2.66666 0H24C24.7333 0 25.3613 0.26133 25.884 0.784C26.4067 1.30666 26.6676 1.93422 26.6667 2.66666V11.1333C26.2889 10.9778 25.9058 10.8613 25.5174 10.784C25.1289 10.7067 24.7342 10.6676 24.3333 10.6667C23.8222 10.6667 23.3111 10.7333 22.8 10.8667C22.2889 11 21.8 11.1889 21.3333 11.4333C21.1333 11.3222 20.9222 11.2222 20.7 11.1333C20.4778 11.0444 20.2445 10.9667 20 10.9V9.3333H15.5L13.2 4.7333C13.0889 4.51111 12.9222 4.34444 12.7 4.23333C12.4778 4.12222 12.2445 4.06666 12 4.06666C11.7556 4.06666 11.5222 4.12222 11.3 4.23333C11.0778 4.34444 10.9111 4.51111 10.8 4.7333L6.66666 13L5.2 10.0667C5.08888 9.8222 4.92222 9.6387 4.7 9.516C4.47777 9.3933 4.24444 9.3324 4 9.3333H0ZM2.66666 21.3333C1.93333 21.3333 1.30577 21.0724 0.784 20.5507C0.26222 20.0289 0.00088 19.4009 0 18.6667V12H3.16666L5.46666 16.6C5.57777 16.8444 5.74444 17.028 5.96666 17.1507C6.18888 17.2733 6.42222 17.3342 6.66666 17.3333C6.91111 17.3324 7.14444 17.2716 7.36668 17.1507C7.58888 17.0298 7.75558 16.8462 7.86668 16.6L12 8.3333L13.4667 11.2667C13.5778 11.4667 13.7169 11.628 13.884 11.7507C14.0511 11.8733 14.2453 11.9564 14.4667 12C13.7111 12.5778 13.1111 13.3 12.6667 14.1667C12.2222 15.0333 12 15.9778 12 17C12 17.9333 12.1391 18.7169 12.4173 19.3507C12.6956 19.9844 13.1453 20.6453 13.7667 21.3333H2.66666ZM18.3333 13.3333C18.9333 13.3333 19.4889 13.4667 20 13.7333C20.5111 14 20.9556 14.3889 21.3333 14.9C21.7111 14.3889 22.1556 14 22.6667 13.7333C23.1778 13.4667 23.7333 13.3333 24.3333 13.3333C25.3556 13.3333 26.2222 13.6889 26.9334 14.4C27.6445 15.1111 28 15.9778 28 17C28 17.8 27.7111 18.5724 27.1334 19.3173C26.5556 20.0622 25.2889 21.2676 23.3333 22.9333L21.3333 24.6667L19.3333 22.9333C17.3778 21.2667 16.1111 20.0613 15.5333 19.3173C14.9556 18.5733 14.6667 17.8009 14.6667 17C14.6667 15.9778 15.0222 15.1111 15.7333 14.4C16.4445 13.6889 17.3111 13.3333 18.3333 13.3333Z" fill="white" />
            </svg>
          )}
          onUpload={handleEcgUpload}
          onViewResult={handleViewEcgResult}
          viewResultLabel="View ECG Result"
          isViewLoading={false}
        />

        <UploadCard
          title="Radiology"
          desc="Upload your X-rays or CT (Optional)."
          Icon={() => (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.3333 4H6.66667C5.18667 4 4 5.18667 4 6.66667V25.3333C4 26.8133 5.18667 28 6.66667 28H25.3333C26.8133 28 28 26.8133 28 25.3333V6.66667C28 5.18667 26.8133 4 25.3333 4ZM22.8 17.3333H17.3333V18.6667H22.6667C22.6667 18.6667 22.5867 22.6667 20.6667 22.6667C18.8667 22.6667 19.3333 20.6267 17.3333 20V22.6667C17.3333 23.4 16.7333 24 16 24C15.2667 24 14.6667 23.4 14.6667 22.6667V20C12.6667 20.6267 13.1333 22.6667 11.3333 22.6667C9.41333 22.6667 9.33333 18.6667 9.33333 18.6667H14.6667V17.3333H9.2C9.13333 16.92 9.12 16.4667 9.06667 16H14.6667V14.6667H9.08C9.10667 14.2267 9.21333 13.7733 9.33333 13.3333H14.6667V12H9.78667C10 11.5333 10.2 11.08 10.44 10.6667H14.6667V9.33333C14.6667 8.6 15.2667 8 16 8C16.7333 8 17.3333 8.6 17.3333 9.33333V10.6667H21.56C21.8 11.08 22 11.5333 22.2133 12H17.3333V13.3333H22.6667C22.8 13.7733 22.8933 14.2267 22.92 14.6667H17.3333V16H22.9333C22.88 16.4667 22.8667 16.92 22.8 17.3333Z" fill="white" />
            </svg>
          )}
          onUpload={handleXrayUpload}
          onViewResult={handleViewXrayResult}
          viewResultLabel="View X-ray Result"
          isViewLoading={xrayAnalyzing}
        />
      </div>

      {/* ── X-ray Error ── */}
      {xrayError && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {xrayError}
        </div>
      )}

      {/* ── ECG Save Error ── */}
      {ecgSaveError && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <span className="font-semibold">Upload Error: </span>{ecgSaveError}
        </div>
      )}

      {/* ── ECG Result ── */}
      {ecgShowResult && (
        <div className="mb-6 animate-fade-in-up">
          <p className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            ECG Result
          </p>
          <EcgSuccessCard />
        </div>
      )}

      {/* ── X-ray Result ── */}
      {xrayShowResult && xrayResult && (
        <div className="w-full max-w-252 mx-auto flex flex-col gap-5 animate-fade-in-up">
          <p className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
            X-ray Analysis
          </p>

          <div className="animate-fade-in-up delay-gauge w-full md:w-[80%] max-w-none md:max-w-224 min-h-55 md:h-62.75 mx-auto bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm px-4 sm:px-6 py-4">
            <div className="flex h-full items-center justify-center">
              <RiskGauge
                percentage={xrayResult.percentage}
                gaugeConfig={xrayResult.gauge}
                level={xrayResult.level}
                isDark={isDark}
              />
            </div>
          </div>

          <div className="animate-fade-in-up delay-alert w-full px-0 sm:px-6 lg:px-14 pt-6 pb-9">
            <RiskDetailsPanel
              result={xrayResult}
              onFindDoctors={() => navigate('/patient/doctors')}
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHeartRisk;
