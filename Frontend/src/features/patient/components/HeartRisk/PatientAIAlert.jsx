import React from 'react';
import { HiOutlineLightningBolt } from 'react-icons/hi';

const RISK_STYLES = {
  high: {
    card: 'from-red-50 to-orange-50 dark:from-[#2A1616] dark:to-[#1E293B] border-red-200 dark:border-red-700/40',
    iconWrap: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-300',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  medium: {
    card: 'from-yellow-50 to-orange-50 dark:from-[#2A2412] dark:to-[#1E293B] border-yellow-200 dark:border-amber-700/40',
    iconWrap: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-300',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  low: {
    card: 'from-emerald-50 to-teal-50 dark:from-[#10241E] dark:to-[#1E293B] border-emerald-200 dark:border-emerald-700/40',
    iconWrap: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

const normalizeRiskLevel = (riskLevel) => {
  const level = String(riskLevel || '').toLowerCase();
  if (level.includes('high')) return 'high';
  if (level.includes('med')) return 'medium';
  return 'low';
};

const PatientAIAlert = ({
  riskLevel = 'High',
  riskMessage = 'Our AI detected a high probability of heart-related issues based on your responses.',
  recommendationMessage = '*Higher accuracy required. Complete your full profile in the Heart Risk Assessment section for deeper medical insights.',
  riskFactors = [],
}) => {
  const levelKey = normalizeRiskLevel(riskLevel);
  const style = RISK_STYLES[levelKey];
  const badgeText = /risk/i.test(String(riskLevel || '')) ? String(riskLevel) : `${riskLevel} Risk`;

  return (
    <div className={`w-full max-w-[674.40px] p-8 bg-gradient-to-br rounded-3xl shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg border flex flex-col gap-3 ${style.card}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconWrap}`}>
          <HiOutlineLightningBolt className={`text-lg ${style.icon}`} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0]">AI Detection Alert</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${style.badge}`}>
              {badgeText}
            </span>
          </div>
          <p className="text-[16px] text-[#364153] dark:text-gray-300">{riskMessage}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-[#0F172A]/80 border border-transparent dark:border-gray-700 rounded-xl p-3">
        <p className="text-[16px] text-[#4A5565] dark:text-gray-300">{recommendationMessage}</p>

        {riskFactors.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {riskFactors.map((factor, index) => (
              <li key={`${factor}-${index}`} className="text-[14px] text-[#4A5565] dark:text-gray-300">
                - {factor}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PatientAIAlert;
