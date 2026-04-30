export const HEART_RATE_OPTIONS = [
  { label: 'Low (< 60 bpm)', value: '<60' },
  { label: 'Normal (60-100 bpm)', value: '60-100' },
  { label: 'Slightly High (101-120 bpm)', value: '>100' },
  { label: 'High (> 120 bpm)', value: '>120' },
];

export const BLOOD_PRESSURE_OPTIONS = [
  { label: 'Low (< 90/60 mmHg)', value: 'low' },
  { label: 'Normal (90-120 / 60-80 mmHg)', value: 'normal' },
  { label: 'Pre-Hypertension (120-139 / 80-89 mmHg)', value: 'elevated' },
  { label: 'High - Stage 1 (140-159 / 90-99 mmHg)', value: 'high' },
  { label: 'High - Stage 2 (>= 160 / >= 100 mmHg)', value: 'very_high' },
];

export const BLOOD_COUNT_OPTIONS = [
  { label: 'Low (< 30%)', value: 'low' },
  { label: 'Normal (30%-45%)', value: 'normal' },
  { label: 'High (> 45%)', value: 'high' },
];

export const HEALTH_METRIC_LABELS = {
  heartRate: Object.fromEntries(HEART_RATE_OPTIONS.map((option) => [option.value, option.label])),
  bloodPressure: Object.fromEntries(BLOOD_PRESSURE_OPTIONS.map((option) => [option.value, option.label])),
  bloodCount: Object.fromEntries(BLOOD_COUNT_OPTIONS.map((option) => [option.value, option.label])),
};

export const HEALTH_METRIC_VALUES = {
  heartRate: { '<60': '50', '60-100': '80', '>100': '110', '>120': '130' },
  bloodPressure: { low: '80/50', normal: '110/70', elevated: '130/85', high: '150/95', very_high: '170/105' },
  bloodCount: { low: '20', normal: '38', high: '50' },
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const numericValue = (value) => {
  const parsed = Number(String(value || '').match(/-?\d+(\.\d+)?/)?.[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const pressureParts = (value) => {
  const parts = String(value || '').match(/\d+(\.\d+)?/g) || [];
  const systolic = Number(parts[0]);
  const diastolic = Number(parts[1]);
  return {
    systolic: Number.isFinite(systolic) ? systolic : null,
    diastolic: Number.isFinite(diastolic) ? diastolic : null,
  };
};

export const getHealthMetricLabel = (metric, value) =>
  HEALTH_METRIC_LABELS[metric]?.[value] ?? value;

export const getHealthMetricStorageValue = (metric, value) =>
  HEALTH_METRIC_VALUES[metric]?.[value] ?? value;

export const coerceHealthMetricSelection = (metric, rawValue) => {
  const text = normalize(rawValue);
  if (!text) return '';

  const directOptions = {
    heartRate: HEART_RATE_OPTIONS,
    bloodPressure: BLOOD_PRESSURE_OPTIONS,
    bloodCount: BLOOD_COUNT_OPTIONS,
  }[metric] || [];

  const direct = directOptions.find((option) =>
    normalize(option.value) === text || normalize(option.label) === text
  );
  if (direct) return direct.value;

  if (metric === 'heartRate') {
    if (text.includes('slightly') || text.includes('101') || text === '>100') return '>100';
    if (text.includes('high') || text.includes('> 120') || text.includes('>120')) return '>120';
    if (text.includes('normal')) return '60-100';
    if (text.includes('low')) return '<60';

    const value = numericValue(text);
    if (value === null) return '';
    if (value < 60) return '<60';
    if (value <= 100) return '60-100';
    if (value <= 120) return '>100';
    return '>120';
  }

  if (metric === 'bloodPressure') {
    if (text.includes('stage 2') || text.includes('very')) return 'very_high';
    if (text.includes('stage 1')) return 'high';
    if (text.includes('pre') || text.includes('elevated')) return 'elevated';
    if (text.includes('normal')) return 'normal';
    if (text.includes('low')) return 'low';

    const { systolic, diastolic } = pressureParts(text);
    if (systolic === null || diastolic === null) return '';
    if (systolic >= 160 || diastolic >= 100) return 'very_high';
    if (systolic >= 140 || diastolic >= 90) return 'high';
    if (systolic >= 120 || diastolic >= 80) return 'elevated';
    if (systolic < 90 || diastolic < 60) return 'low';
    return 'normal';
  }

  if (metric === 'bloodCount') {
    if (text.includes('normal')) return 'normal';
    if (text.includes('high')) return 'high';
    if (text.includes('low')) return 'low';

    const value = numericValue(text);
    if (value === null) return '';
    if (value < 30) return 'low';
    if (value > 45) return 'high';
    return 'normal';
  }

  return '';
};
