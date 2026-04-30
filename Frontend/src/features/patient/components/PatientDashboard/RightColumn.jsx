import SectionHeader from './SectionHeader';
import ProgressRing from './ProgressRing';
import { useState } from 'react';

const AppointmentDocAvatar = ({ src, name }) => {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        className="w-12 h-12 rounded-xl object-cover shrink-0 transition-transform duration-300 group-hover:scale-105"
        alt={name || 'Doctor'}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#333CF5] to-[#9810fa] flex items-center justify-center text-white text-[16px] font-bold shrink-0">
      {(name || 'D')[0].toUpperCase()}
    </div>
  );
};

const getRiskBadgeClass = (level) => {
  const normalized = String(level || '').toLowerCase();
  if (normalized.includes('high')) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
  }
  if (normalized.includes('medium') || normalized.includes('moderate')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  }
  if (normalized.includes('low')) {
    return 'bg-emerald-50 text-green-700 dark:bg-emerald-900/25 dark:text-emerald-300';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const RightColumn = ({ navigate, patient }) => {
  const aiRisk = patient?.aiRisk || {};
  const rawScore = Number(aiRisk.score);
  const levelText = String(aiRisk.level || '').trim();
  const summaryText = String(aiRisk.summary || '').trim();

  const recommendations = Array.isArray(aiRisk.recommendations)
    ? aiRisk.recommendations.filter(Boolean)
    : aiRisk.recommendation
      ? [aiRisk.recommendation]
      : [];

  const topRecommendations = recommendations.slice(0, 3);
  const hasPositiveScore = Number.isFinite(rawScore) && rawScore > 0;

  const hasSummaryData = hasPositiveScore || levelText.length > 0 || summaryText.length > 0 || topRecommendations.length > 0;

  const score = hasSummaryData && Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : 0;

  const riskLevel = levelText || (hasSummaryData ? 'Risk Assessment' : 'No Assessment Yet');
  const appointments = Array.isArray(patient?.appointments)
    ? patient.appointments.slice(0, 2)
    : [];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-gray-700 min-h-47.25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_10px_24px_rgba(2,6,23,0.45)] w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-full gap-4">
          <div className="flex flex-col justify-between h-full gap-4">
            <h3 className="text-xl font-semibold font-['Roboto'] text-black-main-text dark:text-[#E2E8F0]">Health Summary</h3>
            {hasSummaryData ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium font-['Roboto'] text-black-main-text dark:text-[#E2E8F0]">Ai Risk Score</span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${getRiskBadgeClass(riskLevel)}`}>
                    {riskLevel}
                  </span>
                </div>
                <p className="text-neutral-500 dark:text-gray-400 text-xs sm:text-sm font-normal font-['Roboto'] leading-relaxed">
                  {summaryText || 'Keep tracking your health inputs to receive a personalized summary.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-neutral-500 dark:text-gray-400 text-xs sm:text-sm font-normal font-['Roboto'] leading-relaxed">
                  No health summary available yet. Upload an X-ray on the Heart Risk Assessment page to get your AI risk score.
                </p>
                <button
                  onClick={() => navigate('/patient/heart-risk')}
                  className="self-start px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-[#333CF5] text-white text-sm sm:text-base font-bold font-['Roboto'] cursor-pointer transition-all duration-300 hover:bg-[#2730d4] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(51,60,245,0.35)] shadow-[0_8px_20px_rgba(51,60,245,0.25)]"
                >
                  Heart Risk Assessment
                </button>
              </div>
            )}
          </div>
          <div className="self-start sm:self-auto">
            <ProgressRing percentage={score} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_10px_24px_rgba(2,6,23,0.45)] w-full">
        <div className="flex flex-col gap-5">
          <h3 className="text-xl font-semibold font-['Roboto'] text-black-main-text dark:text-[#E2E8F0]">Smart Recommendation</h3>
          {topRecommendations.length > 0 ? (
            <div className="flex flex-col gap-4">
              {topRecommendations.map((item, i) => (
                <div key={`${item}-${i}`} className="flex items-start gap-3">
                  <span className="text-[#333CF5] mt-0.5">•</span>
                  <span className="text-black-main-text dark:text-gray-300 text-sm font-medium font-['Roboto']">{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-4">
              <p className="text-sm text-slate-500 dark:text-slate-300 font-['Roboto']">
                No recommendations yet. Fill in your health survey to receive personalized guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] border border-zinc-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_10px_24px_rgba(2,6,23,0.45)] w-full">
        <div className="flex flex-col gap-3 w-full">
          <SectionHeader title="Upcoming Appointments" onViewMore={() => navigate('/patient/appointments')} />
          <div className="flex flex-col gap-4 w-full">
            {appointments.length > 0 ? appointments.map((appointment, index) => (
              <div key={index}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 group cursor-pointer w-full">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <AppointmentDocAvatar src={appointment.img} name={appointment.doctorName} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold font-['Roboto'] text-black-main-text dark:text-[#E2E8F0] wrap-break-word">
                        {appointment.doctorName || 'Doctor'}
                      </span>
                      <span className="text-xs font-normal font-['Roboto'] text-neutral-400 dark:text-gray-400 mt-0.5">
                        {appointment.location || 'No location provided'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row justify-between sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-right w-full sm:w-auto border-t border-zinc-100 dark:border-gray-700 pt-2 sm:border-0 sm:pt-0">
                    <span className="text-sm font-semibold font-['Roboto'] text-black-main-text dark:text-[#E2E8F0]">
                      {appointment.date || 'Date pending'}
                    </span>
                    <span className="text-xs font-normal font-['Roboto'] text-neutral-400 dark:text-gray-400">
                      at: {appointment.time || 'Time pending'}
                    </span>
                  </div>
                </div>
                {index < appointments.length - 1 && <div className="border-t border-zinc-100 dark:border-gray-700 w-full mt-4" />}
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-800/40 px-4 py-4">
                <p className="text-sm text-slate-500 dark:text-slate-300 font-['Roboto']">
                  No upcoming appointments yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightColumn;
