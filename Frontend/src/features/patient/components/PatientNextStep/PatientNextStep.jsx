import React from 'react';
import { HiOutlineHeart, HiOutlineArrowRight } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const normalizeRiskLevel = (riskLevel) => {
  const level = String(riskLevel || '').toLowerCase();
  if (level.includes('high')) return 'high';
  if (level.includes('med')) return 'medium';
  return 'low';
};

const PatientNextStep = ({ requiresFullAssessment = true, riskLevel = 'High' }) => {
  const navigate = useNavigate();
  const riskKey = normalizeRiskLevel(riskLevel);
  const showAssessmentStep = requiresFullAssessment || riskKey !== 'low';

  const content = showAssessmentStep
    ? {
      title: 'Take the Next Step',
      description: 'Get a comprehensive heart health assessment with our advanced AI analysis',
      buttonLabel: 'Proceed to Full Assessment',
      onClick: () => navigate('/patient/heart-risk'),
    }
    : {
      title: 'Great Progress',
      description: 'Your current survey result is reassuring. Keep your healthy routine and stay consistent.',
      buttonLabel: 'Back to Dashboard',
      onClick: () => navigate('/patient/dashboard'),
    };

  return (
    <section
      className="w-full max-w-[674.40px] bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center gap-4"
      style={{ "--nextstep-muted": "#DBEAFE" }}
      aria-label="Next step"
    >
      <HiOutlineHeart className="text-white text-[50px]" aria-label="Heart" />
      <h2 className="text-[30px] font-bold text-white">{content.title}</h2>
      <p className="text-[24px] text-[var(--nextstep-muted)]">
        {content.description}
      </p>
      <button
        className="border-2 bg-white border-white text-brand-main hover:bg-white dark:bg-[#111827] cursor-pointer transition-colors px-6 py-2.5 rounded-full text-[13px] font-bold flex items-center gap-2"
        onClick={content.onClick}
      >
        {content.buttonLabel} <HiOutlineArrowRight aria-label="Proceed" />
      </button>
    </section>
  );
};

export default PatientNextStep;
