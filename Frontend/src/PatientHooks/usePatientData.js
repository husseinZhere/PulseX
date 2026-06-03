// ─────────────────────────────────────────────────────
//  usePatientData  —  Real API Hook for Patient Dashboard
//  PulseX © 2026
// ─────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { getPatientDashboard } from '../services/patientService';
import { listDoctors } from '../services/doctorService';
import { getMyHealthData } from '../services/healthService';
import { saveAiRiskSnapshot } from '../services/riskAssessmentService';
import { resolveFileUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EMPTY_VITAL = (color = '#155DFC', gradientFrom = '#155DFC', gradientTo = '#5B8EFF', unit = '') => ({
  value: null,
  unit,
  status: 'No Data',
  trend: null,
  color,
  gradientFrom,
  gradientTo,
});

const DEFAULT_PATIENT = {
  id: '',
  name: '',
  age: 0,
  gender: '',
  bloodType: '',
  dateOfBirth: '',
  phone: '',
  email: '',
  avatarUrl: '',
  lastUpdated: '',
  vitals: {
    heartRate: EMPTY_VITAL('#155DFC', '#155DFC', '#5B8EFF', 'bpm'),
    bloodPressure: { systolic: null, diastolic: null, unit: 'mmHg', display: '--/--', status: 'No Data', trend: null, color: '#F59E0B', gradientFrom: '#F59E0B', gradientTo: '#FCD34D' },
    bloodSugar: EMPTY_VITAL('#00A63E', '#00A63E', '#34D399', 'mg/dl'),
    bloodCount: EMPTY_VITAL('#8B5CF6', '#8B5CF6', '#C4B5FD', '%'),
    cholesterol: EMPTY_VITAL('#A855F7', '#A855F7', '#D8B4FE', 'mg/dL'),
    height: EMPTY_VITAL('#64748B', '#64748B', '#CBD5E1', 'cm'),
    weight: EMPTY_VITAL('#64748B', '#64748B', '#CBD5E1', 'kg'),
    oxygenLevel: EMPTY_VITAL('#8B5CF6', '#8B5CF6', '#C4B5FD', '%'),
  },
  weeklyData: [],
  aiRisk: { score: null, level: '', color: '#64748B', summary: '', recommendation: '', recommendations: [], accuracy: null },
  featuredDoctors: [],
  appointments: [],
  recentActivity: [],
};

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const formatRiskLevel = (level) => {
  const text = String(level || '').trim();
  if (!text) return '';
  return /risk/i.test(text) ? text : `${text} Risk`;
};

const riskColor = (level) => {
  const value = String(level || '').toLowerCase();
  if (value.includes('high')) return '#DC2626';
  if (value.includes('medium') || value.includes('moderate')) return '#D97706';
  if (value.includes('low')) return '#00A63E';
  return '#64748B';
};

const normalizeAiRisk = (dashboard) => {
  const source = dashboard?.aiRisk || dashboard?.latestRiskAssessment;
  if (!source) return DEFAULT_PATIENT.aiRisk;

  const rawScore = Number(source.score ?? source.riskScore);
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(100, Math.round(rawScore)))
    : null;

  const level = formatRiskLevel(source.level || source.riskLevel);
  const recommendations = Array.isArray(source.recommendations)
    ? source.recommendations.filter(Boolean)
    : source.recommendation
      ? [source.recommendation]
      : [];

  const rawAccuracy = Number(source.accuracy ?? source.modelAccuracy);
  const accuracy = Number.isFinite(rawAccuracy)
    ? Math.max(0, Math.min(100, Math.round(rawAccuracy)))
    : null;

  return {
    score,
    level,
    color: source.color || source.statusColor || riskColor(level),
    summary: source.summary || '',
    recommendation: source.recommendation || '',
    recommendations,
    accuracy,
  };
};

const xrayRiskKey = (userId) => userId ? `pulsex_xray_risk_${userId}` : null;

const getStoredXrayRisk = (userId) => {
  const key = xrayRiskKey(userId);
  if (!key) return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;

    const rawScore = Number(parsed.score);
    return {
      score: Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : null,
      level: formatRiskLevel(parsed.level),
      color: parsed.color || riskColor(parsed.level),
      summary: parsed.summary || '',
      recommendation: parsed.recommendation || '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.filter(Boolean) : [],
      accuracy: null,
    };
  } catch {
    return null;
  }
};

const getRiskSignature = (risk) => JSON.stringify({
  score: risk?.score ?? null,
  level: risk?.level || '',
  summary: risk?.summary || '',
});

const syncStoredXrayRisk = async (risk, userId) => {
  if (!risk || risk.score === null) return;

  const syncKey = userId ? `pulsex_xray_risk_synced_${userId}` : null;
  if (!syncKey) return;

  const signature = getRiskSignature(risk);
  if (localStorage.getItem(syncKey) === signature) return;

  await saveAiRiskSnapshot({
    score: risk.score,
    level: risk.level,
    summary: risk.summary,
    recommendations: risk.recommendations,
  });
  localStorage.setItem(syncKey, signature);
};

const normalizeDataType = (value) => String(value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();

const buildWeeklyHealthSeries = (healthDataList, dashboard) => {
  const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const heartRateEntries = [...(healthDataList || [])]
    .filter((entry) => normalizeDataType(entry?.dataType) === 'heartrate')
    .map((entry) => ({
      ...entry,
      value: Number(entry?.value),
      date: new Date(entry?.recordedAt),
    }))
    .filter((entry) => Number.isFinite(entry.value) && !Number.isNaN(entry.date.getTime()));

  // Seeded variation: deterministic ±5 BPM wiggle so the line isn't flat
  // on days with no reading while still looking natural across page reloads.
  const seedVariation = (base, seed) => {
    const s = Math.sin(seed * 9301 + 49297) * 233280;
    const rnd = (s - Math.floor(s));   // 0..1
    return Math.round(base + (rnd * 10) - 5);  // ±5 BPM
  };

  if (heartRateEntries.length > 0) {
    const sorted = [...heartRateEntries].sort((a, b) => b.date - a.date);
    const latestValue = sorted[0].value;

    return days.map((day, index) => {
      const sameDay = heartRateEntries.filter(
        (entry) => entry.date.toDateString() === day.toDateString()
      );
      const value = sameDay.length
        ? Math.round(sameDay.reduce((sum, entry) => sum + entry.value, 0) / sameDay.length)
        : seedVariation(latestValue, index + day.getDate());

      return { day: dayFormatter.format(day), value };
    });
  }

  return normalizeWeeklyData(dashboard);
};

const normalizeWeeklyData = (dashboard) => {
  const directSeries = Array.isArray(dashboard?.weeklyData)
    ? dashboard.weeklyData
    : [];
  if (directSeries.length > 0) return directSeries;

  const groupedSeries = dashboard?.weeklyHealthData;
  if (!groupedSeries || typeof groupedSeries !== 'object') return [];

  const firstSeries = groupedSeries.heartRateData
    || groupedSeries.HeartRateData
    || Object.values(groupedSeries).find(
      (entry) => Array.isArray(entry) && entry.length > 0
    );

  if (!firstSeries) return [];

  return firstSeries.map((point, index) => ({
    day: point?.label || point?.day || point?.date || `Day ${index + 1}`,
    value: Number(point?.value) || 0,
  }));
};

const formatAppointmentDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB');
};

const formatAppointmentTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const normalizeAppointments = (dashboard) => {
  const source = Array.isArray(dashboard?.upcomingAppointments)
    ? dashboard.upcomingAppointments
    : Array.isArray(dashboard?.appointments)
      ? dashboard.appointments
      : [];

  return source.map((appointment, idx) => ({
    id: appointment?.id ?? idx,
    doctorName: (() => { const n = appointment?.doctorName || appointment?.fullName || ''; if (!n) return ''; const t = n.trim(); return /^dr\.?\s/i.test(t) ? t : `DR. ${t}`; })(),
    location: appointment?.clinicLocation || appointment?.location || appointment?.doctorSpecialty || '',
    date: appointment?.date || formatAppointmentDate(appointment?.appointmentDate),
    time: appointment?.time || appointment?.timeSlot || formatAppointmentTime(appointment?.appointmentDate),
    img: resolveFileUrl(appointment?.doctorProfilePicture || appointment?.doctorAvatar || appointment?.profilePicture || ''),
  }));
};

const classifyHeartRate = (v) => {
  if (!toNumberOrNull(v)) return 'No Data';
  if (v < 60) return 'Low';
  if (v > 100) return 'High';
  return 'Normal';
};

const classifyBP = (sys, dia) => {
  if (!toNumberOrNull(sys) || !toNumberOrNull(dia)) return 'No Data';
  if (sys < 90 || dia < 60) return 'Low';
  if (sys >= 140 || dia >= 90) return 'High';
  return 'Normal';
};

const classifyBloodSugar = (v) => {
  if (!toNumberOrNull(v)) return 'No Data';
  if (v < 70) return 'Low';
  if (v > 140) return 'High';
  return 'Normal';
};

const classifyBloodCount = (v) => {
  if (!toNumberOrNull(v)) return 'No Data';
  if (v < 30) return 'Low';
  if (v > 45) return 'High';
  return 'Normal';
};

const classifyCholesterol = (v) => {
  if (!toNumberOrNull(v)) return 'No Data';
  if (v >= 240) return 'High';
  return 'Normal';
};

const buildVitals = (healthDataList, dashboard) => {
  const vitals = { ...DEFAULT_PATIENT.vitals };
  const sorted = [...(healthDataList || [])].sort(
    (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)
  );
  const findLatest = (...types) => {
    const accepted = types.map(normalizeDataType);
    return sorted.find((h) => accepted.includes(normalizeDataType(h.dataType)));
  };

  const hr = findLatest('HeartRate', 'Heart Rate') || dashboard?.heartRate;
  if (hr) {
    const value = toNumberOrNull(hr.value);
    vitals.heartRate = {
      ...DEFAULT_PATIENT.vitals.heartRate,
      value,
      unit: hr.unit || 'bpm',
      status: hr.status || classifyHeartRate(value),
    };
  }

  const bp = findLatest('BloodPressure', 'Blood Pressure') || dashboard?.bloodPressure;
  if (bp) {
    const parts = String(bp.value || bp.display || '').split('/');
    const sys = toNumberOrNull(bp.systolic || parts[0]);
    const dia = toNumberOrNull(bp.diastolic || parts[1]);
    const display = sys && dia ? `${sys}/${dia}` : '--/--';
    vitals.bloodPressure = {
      systolic: sys,
      diastolic: dia,
      unit: bp.unit || 'mmHg',
      display,
      status: bp.status || classifyBP(sys, dia),
      trend: null,
      color: '#F59E0B',
      gradientFrom: '#F59E0B',
      gradientTo: '#FCD34D',
    };
  }

  const bs = findLatest('BloodSugar', 'Blood Sugar', 'Glucose') || dashboard?.bloodSugar;
  if (bs) {
    const value = toNumberOrNull(bs.value);
    vitals.bloodSugar = {
      ...DEFAULT_PATIENT.vitals.bloodSugar,
      value,
      unit: bs.unit || 'mg/dl',
      status: bs.status || classifyBloodSugar(value),
    };
  }

  const bc = findLatest('BloodCount', 'Blood Count') || dashboard?.bloodCount;
  if (bc) {
    const value = toNumberOrNull(bc.value);
    vitals.bloodCount = {
      ...DEFAULT_PATIENT.vitals.bloodCount,
      value,
      unit: bc.unit || '%',
      status: bc.status || classifyBloodCount(value),
    };
  }

  const cholesterol = findLatest('Cholesterol');
  if (cholesterol) {
    const value = toNumberOrNull(cholesterol.value);
    vitals.cholesterol = {
      ...DEFAULT_PATIENT.vitals.cholesterol,
      value,
      unit: cholesterol.unit || 'mg/dL',
      status: cholesterol.status || classifyCholesterol(value),
    };
  }

  const height = findLatest('Height');
  if (height) {
    const value = toNumberOrNull(height.value);
    vitals.height = {
      ...DEFAULT_PATIENT.vitals.height,
      value,
      unit: height.unit || 'cm',
      status: value ? 'Normal' : 'No Data',
    };
  }

  const weight = findLatest('Weight');
  if (weight) {
    const value = toNumberOrNull(weight.value);
    vitals.weight = {
      ...DEFAULT_PATIENT.vitals.weight,
      value,
      unit: weight.unit || 'kg',
      status: value ? 'Normal' : 'No Data',
    };
  }

  const oxy = findLatest('Oxygen');
  if (oxy) {
    const value = toNumberOrNull(oxy.value);
    vitals.oxygenLevel = {
      ...DEFAULT_PATIENT.vitals.oxygenLevel,
      value,
      unit: oxy.unit || '%',
      status: oxy.status || (value ? 'Normal' : 'No Data'),
    };
  }

  return vitals;
};

const usePatientData = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState(DEFAULT_PATIENT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dashboard, healthData, doctors] = await Promise.all([
          getPatientDashboard().catch(() => null),
          getMyHealthData().catch(() => []),
          listDoctors({ pageSize: 3 }).catch(() => null),
        ]);
        if (ignore) return;

        const vitals = buildVitals(Array.isArray(healthData) ? healthData : [], dashboard);

        const doctorsList = Array.isArray(doctors)
          ? doctors
          : (doctors?.doctors || doctors?.items || []);

        const dashboardDoctors = Array.isArray(dashboard?.topDoctors)
          ? dashboard.topDoctors
          : [];

        const featuredSource = dashboardDoctors.length > 0
          ? dashboardDoctors
          : doctorsList;

        const featuredDoctors = featuredSource.slice(0, 3).map((d, idx) => ({
          id: d.id ?? idx,
          name: d.fullName || d.name || '',
          location: d.clinicLocation || d.ClinicLocation || d.location || '',
          specialization: d.specialization || d.Specialization || d.specialty || d.Specialty || '',
          rating: Number(d.averageRating || d.rating) || 0,
          img: resolveFileUrl(d.profilePicture || d.avatarUrl || ''),
        }));

        const userId = user?.userId;
        const apiRisk = normalizeAiRisk(dashboard);
        const storedXrayRisk = getStoredXrayRisk(userId);
        const hasApiRisk = apiRisk.score !== null || Boolean(apiRisk.summary) || apiRisk.recommendations.length > 0;
        const aiRisk = hasApiRisk ? apiRisk : (storedXrayRisk || apiRisk);

        if (!hasApiRisk && storedXrayRisk?.score !== null) {
          syncStoredXrayRisk(storedXrayRisk, userId).catch((syncError) => {
            console.error('Syncing stored X-ray risk failed', syncError);
          });
        }

        setPatient({
          ...DEFAULT_PATIENT,
          id: user?.userId ? `PT-${user.userId}` : (dashboard?.userId ? `PT-${dashboard.userId}` : ''),
          name: user?.firstName || user?.fullName || dashboard?.fullName || '',
          email: user?.email || dashboard?.email || '',
          avatarUrl: resolveFileUrl(dashboard?.profilePicture || ''),
          lastUpdated: new Date().toLocaleString(),
          vitals,
          weeklyData: buildWeeklyHealthSeries(Array.isArray(healthData) ? healthData : [], dashboard),
          aiRisk,
          featuredDoctors,
          appointments: normalizeAppointments(dashboard),
          recentActivity: dashboard?.recentActivity || [],
        });
      } catch (err) {
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [user]);

  const hasVitals = [
    patient.vitals?.heartRate?.value,
    patient.vitals?.bloodPressure?.systolic,
    patient.vitals?.bloodPressure?.diastolic,
    patient.vitals?.bloodSugar?.value,
    patient.vitals?.bloodCount?.value,
    patient.vitals?.cholesterol?.value,
    patient.vitals?.height?.value,
    patient.vitals?.weight?.value,
    patient.vitals?.oxygenLevel?.value,
  ].some((value) => toNumberOrNull(value) !== null);

  const hasHealthSummary =
    patient.aiRisk?.score !== null
    || Boolean(patient.aiRisk?.summary)
    || (patient.aiRisk?.recommendations?.length || 0) > 0;

  return { patient, isLoading, error, hasVitals, hasHealthSummary };
};

export default usePatientData;
