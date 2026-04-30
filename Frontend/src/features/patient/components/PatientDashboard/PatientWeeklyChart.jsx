import React, { useEffect, useId, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDay = (raw, index) => {
  if (!raw) return DAY_LABELS[index] || `Day ${index + 1}`;

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  const text = String(raw).trim();
  return text.length > 3 ? text.slice(0, 3) : text;
};

const normalizeSeries = (weeklyData) => {
  if (!Array.isArray(weeklyData)) return [];

  return weeklyData
    .map((entry, index) => {
      if (typeof entry === 'number') {
        return { day: DAY_LABELS[index] || `Day ${index + 1}`, value: Math.max(0, entry) };
      }

      const value = Number(entry?.value ?? entry?.score ?? entry?.amount);
      return {
        day: formatDay(entry?.day || entry?.label || entry?.date, index),
        value: Number.isFinite(value) ? Math.max(0, value) : 0,
      };
    })
    .filter((item) => Number.isFinite(item.value));
};

const PatientWeeklyChart = ({ weeklyData = [] }) => {
  const [isDark, setIsDark] = useState(false);
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setIsDark(root.classList.contains('dark'));

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const axisTickColor = isDark ? '#94A3B8' : '#7D7D7D';
  const tooltipBg = isDark ? '#0F172A' : '#FFFFFF';
  const tooltipBorder = isDark ? '#334155' : '#E5E7EB';
  const tooltipText = isDark ? '#E2E8F0' : '#111827';
  const data = normalizeSeries(weeklyData);
  const hasData = data.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header section */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-tight font-['Roboto']">
            Weekly Health Overview
          </h3>
          <p className="text-[13px] text-gray-text-dim2 mt-1 font-['Roboto']">
            Analyze how your heart health improves throughout the week
          </p>
        </div>
        <span className="text-[14px] text-gray-text-dim2 font-medium font-['Roboto']">
          This Week
        </span>
      </div>

      {/* Chart Container */}
      <div className="flex-1 w-full min-h-45">
        {hasData ? (
          <ResponsiveContainer width="100%" height="250">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id={`${gradientId}-chartGradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4850E9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#45D0EE" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisTickColor, fontSize: 11, fontWeight: 400 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fill: axisTickColor, fontSize: 11 }}
              />

              <Tooltip
                cursor={{ stroke: '#4850E9', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontFamily: 'Roboto',
                  color: tooltipText,
                }}
                labelStyle={{ color: tooltipText, fontWeight: 600 }}
                itemStyle={{ color: tooltipText }}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#4850E9"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradientId}-chartGradient)`}
                dot={{ r: 3, strokeWidth: 2, fill: '#FFFFFF', stroke: '#4850E9' }}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#4850E9', stroke: '#FFFFFF' }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-[#0F172A] flex items-center justify-center px-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-300 font-['Roboto']">
              No weekly health data yet. Complete your health survey to start tracking trends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientWeeklyChart;
