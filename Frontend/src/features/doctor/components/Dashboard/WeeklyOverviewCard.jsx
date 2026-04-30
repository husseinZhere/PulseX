import React, { useId, useState } from 'react';

const Point = ({ x, y, active, delay = '0s' }) => (
  <g>
    {active && (
      <circle cx={x} cy={y} r="6" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.45">
        <animate attributeName="r" values="6;12;6" dur="2.8s" begin={delay} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.45;0;0.45" dur="2.8s" begin={delay} repeatCount="indefinite" />
      </circle>
    )}
    <circle
      cx={x}
      cy={y}
      r={active ? '5' : '4.5'}
      fill="#fff"
      stroke={active ? '#A78BFA' : '#D8B4E2'}
      strokeWidth={active ? '3' : '2.5'}
      className="transition-all duration-300"
      style={{ filter: active ? 'drop-shadow(0px 2px 6px rgba(167, 139, 250, 0.45))' : 'none' }}
    >
      <animate attributeName="r" values={active ? '5;5.8;5' : '4.5;5.1;4.5'} dur={active ? '2.2s' : '3s'} begin={delay} repeatCount="indefinite" />
    </circle>
  </g>
);

const WeeklyOverviewCard = ({ hasData, overview }) => {
  const uniqueId = useId().replace(/:/g, '');
  const stats = Array.isArray(overview?.dailyStats) ? overview.dailyStats : [];
  const maxValue = Math.max(1, ...stats.map((item) => Number(item.appointmentsCount || 0)));
  const chartPoints = stats.map((item, index) => {
    const steps = Math.max(1, stats.length - 1);
    const x = 8 + (index * (547 / steps));
    const value = Number(item.appointmentsCount || 0);
    const y = 178 - ((value / maxValue) * 130);
    return { x, y, value, label: item.day || '', patients: item.patientsCount || 0 };
  });
  const defaultPointIndex = Math.max(0, chartPoints.length - 1);
  const [activePointIndex, setActivePointIndex] = useState(defaultPointIndex);
  const [isChartHovered, setIsChartHovered] = useState(false);
  const hasOverviewData = hasData && chartPoints.some((point) => point.value > 0 || point.patients > 0);

  if (!hasOverviewData) {
    return (
      <section className="rounded-[24px] border border-[#E6EAF0] dark:border-gray-700 shadow-sm dark:shadow-none bg-white dark:bg-[#111827] p-5 sm:p-7 flex flex-col gap-5" aria-labelledby="weekly-overview-title-empty">
        <div className="flex items-start justify-between">
          <div>
            <h2 id="weekly-overview-title-empty" className="text-[20px] font-bold text-[#010218] dark:text-[#E2E8F0]">Weekly Overview</h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">Patient visits throughout the week</p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] dark:from-[#1e1b4b]/50 dark:to-[#1e293b] flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 560 170" className="w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ghostAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="20" x2="560" y2="20" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="5 5" />
            <line x1="0" y1="60" x2="560" y2="60" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="5 5" />
            <line x1="0" y1="100" x2="560" y2="100" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="5 5" />
            <line x1="0" y1="140" x2="560" y2="140" stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="5 5" />
            <path d="M 8 135 L 90 105 L 180 62 L 280 28 L 370 52 L 460 82 L 552 115 L 552 155 L 8 155 Z" fill="url(#ghostAreaGrad)" />
            <path d="M 8 135 L 90 105 L 180 62 L 280 28 L 370 52 L 460 82 L 552 115" fill="none" stroke="#C7D2FE" strokeWidth="2.5" strokeDasharray="7 5" strokeLinecap="round" strokeLinejoin="round" />
            {[[8,135],[90,105],[180,62],[280,28],[370,52],[460,82],[552,115]].map(([cx, cy]) => (
              <circle key={cx} cx={cx} cy={cy} r="5" fill="white" stroke="#C7D2FE" strokeWidth="2.5" />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <div className="rounded-2xl bg-white/90 dark:bg-[#111827]/90 px-5 py-3 text-center shadow-sm border border-[#E2E8F0] dark:border-gray-700">
              <p className="text-[15px] font-bold text-[#374151] dark:text-[#E2E8F0]">No Data Available</p>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">Stats appear once you start seeing patients</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-[11px] font-medium text-[#CBD5E1] px-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
        </div>
      </section>
    );
  }

  const totalAppts = stats.reduce((sum, s) => sum + Number(s.appointmentsCount || 0), 0);
  const totalPatients = stats.reduce((sum, s) => sum + Number(s.patientsCount || 0), 0);
  const peakDay = stats.reduce((best, s) => Number(s.appointmentsCount) > Number(best.appointmentsCount || 0) ? s : best, {}).day || '—';
  const avgPerDay = stats.length ? Math.round(totalAppts / stats.length) : 0;

  const yLabels = [maxValue, Math.round(maxValue * 0.8), Math.round(maxValue * 0.6), Math.round(maxValue * 0.4), Math.round(maxValue * 0.2), 0];

  const linePath = chartPoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  const firstPoint = chartPoints[0];
  const lastPoint = chartPoints[chartPoints.length - 1];
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(1)} 180 L ${firstPoint.x.toFixed(1)} 180 Z`;
  const lineGradId = `lineGrad-${uniqueId}`;
  const areaGradId = `areaGrad-${uniqueId}`;
  const glowId = `glow-${uniqueId}`;
  const linePathId = `linePath-${uniqueId}`;
  const activePoint = chartPoints[activePointIndex];
  const tooltipRectX = Math.min(Math.max(activePoint.x - 28, 8), 500);
  const tooltipRectY = Math.max(activePoint.y - 70, 4);
  const tooltipCenterX = tooltipRectX + 28;

  return (
    <section
      className="rounded-[24px] border-[0.5px] border-[#E5E7EB] dark:border-gray-700 shadow-[0_4px_24px_rgba(139,92,246,0.09)] bg-white dark:bg-[#111827] p-6 sm:p-7 flex flex-col gap-4"
      aria-labelledby="weekly-overview-title"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 id="weekly-overview-title" className="text-[20px] font-bold text-[#010218] dark:text-[#E2E8F0]">Weekly Overview</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Patient visits this week</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[22px] font-bold text-[#010218] dark:text-[#E2E8F0] leading-none">{totalAppts}</p>
            <p className="text-[11px] text-[#9CA3AF] font-medium mt-0.5">Total Appts</p>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] dark:from-[#1e1b4b]/60 dark:to-[#1e293b] flex items-center justify-center shadow-sm">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full relative flex flex-col mt-1">
        <div className="grid grid-cols-[30px_1fr] gap-4 text-[11px] text-[#6B7280] flex-1 min-h-[220px]">
          <div className="flex flex-col justify-between pt-[8px] pb-[36px] font-medium opacity-60">
            {yLabels.map((v) => <span key={v} className="text-right">{v}</span>)}
          </div>
          <div className="relative flex flex-col h-full w-full">
            <svg
              viewBox="0 0 560 210"
              className="w-full flex-1 overflow-visible mt-2 cursor-crosshair"
              preserveAspectRatio="none"
              onMouseEnter={() => setIsChartHovered(true)}
              onMouseLeave={() => { setIsChartHovered(false); setActivePointIndex(defaultPointIndex); }}
              onMouseMove={(event) => {
                const { left, width } = event.currentTarget.getBoundingClientRect();
                if (!width) return;
                const relativeX = ((event.clientX - left) / width) * 560;
                let nearestIndex = 0;
                let minDistance = Infinity;
                chartPoints.forEach((point, index) => {
                  const distance = Math.abs(point.x - relativeX);
                  if (distance < minDistance) { minDistance = distance; nearestIndex = index; }
                });
                setActivePointIndex((prev) => (prev === nearestIndex ? prev : nearestIndex));
              }}
            >
              <defs>
                <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4EA6FF">
                    <animate attributeName="stop-color" values="#4EA6FF;#6D8CFF;#4EA6FF" dur="6s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#FF4FD8">
                    <animate attributeName="stop-color" values="#FF4FD8;#C670FF;#FF4FD8" dur="6s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                  <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#FF4FD8" stopOpacity="0.0" />
                </linearGradient>
                <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#8B5CF6" floodOpacity="0.28" />
                </filter>
              </defs>

              <path id={linePathId} d={linePath} fill="none" stroke="transparent" strokeWidth="0" />

              <line x1="5" y1="18" x2="555" y2="18" stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="5" y1="48" x2="555" y2="48" stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="5" y1="78" x2="555" y2="78" stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="5" y1="108" x2="555" y2="108" stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="5" y1="138" x2="555" y2="138" stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1" />
              <line x1="5" y1="168" x2="555" y2="168" stroke="#0F172A" strokeOpacity="0.05" strokeWidth="1" />

              <path d={areaPath} fill={`url(#${areaGradId})`} opacity="0">
                <animate attributeName="opacity" from="0" to="1" dur="0.8s" begin="0.35s" fill="freeze" />
              </path>

              <path
                d={linePath}
                fill="none"
                stroke={`url(#${lineGradId})`}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
              >
                <animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.4s" fill="freeze" />
              </path>

              <line
                x1={activePoint.x} y1={activePoint.y} x2={activePoint.x} y2="178"
                stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round"
                opacity={isChartHovered ? '0.95' : '0.8'}
              />

              {chartPoints.map((point, index) => (
                <Point key={`${point.x}-${point.y}`} x={point.x} y={point.y} active={index === activePointIndex} delay={`${1.05 + (index * 0.1)}s`} />
              ))}

              <g opacity={isChartHovered ? '0.55' : '0.95'}>
                <circle r="4.2" fill="#ffffff" stroke="#60A5FA" strokeWidth="1.4" filter={`url(#${glowId})`}>
                  <animate attributeName="opacity" values="0;1;1;0" dur="5.2s" repeatCount="indefinite" />
                  <animateMotion dur="5.2s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#${linePathId}`} />
                  </animateMotion>
                </circle>
              </g>

              <g opacity={isChartHovered ? '1' : '0.95'}>
                <rect x={tooltipRectX} y={tooltipRectY} width="56" height="40" rx="8" fill="#333CF5" />
                <polygon points={`${tooltipCenterX - 5},${tooltipRectY + 39} ${tooltipCenterX + 5},${tooltipRectY + 39} ${tooltipCenterX},${tooltipRectY + 47}`} fill="#333CF5" />
                <text x={tooltipCenterX} y={tooltipRectY + 15} textAnchor="middle" fill="#ffffff" fillOpacity="0.75" fontSize="7.5" fontWeight="500" className="font-sans">Appts</text>
                <text x={tooltipCenterX} y={tooltipRectY + 30} textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="700" className="font-sans">{activePoint.value}</text>
              </g>
            </svg>

            <div className="flex justify-between text-center text-[12px] opacity-60 font-medium mt-1 px-1">
              {stats.map((item) => <span key={item.day}>{item.day}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <div className="border-t border-[#F1F5F9] dark:border-gray-800 pt-4 mt-1 grid grid-cols-3 gap-2">
        {[
          { label: 'Peak Day', value: peakDay },
          { label: 'Total Patients', value: totalPatients },
          { label: 'Avg / Day', value: avgPerDay },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[10.5px] text-[#9CA3AF] font-medium uppercase tracking-wide">{label}</p>
            <p className="text-[15px] font-bold text-[#010218] dark:text-[#E2E8F0] mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeeklyOverviewCard;
