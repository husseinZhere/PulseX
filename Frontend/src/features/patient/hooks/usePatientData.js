// ─────────────────────────────────────────────────────
//  usePatientData  —  Mock Data Hook for Patient Dashboard
//  PulseX © 2026
// ─────────────────────────────────────────────────────

import { useState } from "react";

// ─── Static Mock Data ────────────────────────────────
const PATIENT_MOCK = {
  // ── Identity ──────────────────────────────────────
  id: "PT-20260215-001",
  name: "Mohamed Salem",
  age: 34,
  gender: "Male",
  bloodType: "O+",
  dateOfBirth: "1992-04-10",
  phone: "+20 100 000 0001",
  email: "mohamed.salem@pulsex.io",
  avatarUrl: "", // fallback handled in components
  lastUpdated: "Sunday, February 15, 2026",

  // ── Vital Signs ───────────────────────────────────
  vitals: {
    heartRate: {
      value: 75,
      unit: "bpm",
      status: "Normal",
      trend: "+2", // vs last reading
      color: "#155DFC",
      gradientFrom: "#155DFC",
      gradientTo: "#5B8EFF",
    },
    bloodPressure: {
      systolic: 80,
      diastolic: 60,
      unit: "mmHg",
      display: "80/60",
      status: "Low — Monitor",
      trend: "-3",
      color: "#F59E0B",
      gradientFrom: "#F59E0B",
      gradientTo: "#FCD34D",
    },
    bloodSugar: {
      value: 95,
      unit: "mg/dl",
      status: "Normal",
      trend: "+1",
      color: "#00A63E",
      gradientFrom: "#00A63E",
      gradientTo: "#34D399",
    },
    oxygenLevel: {
      value: 98,
      unit: "%",
      status: "Normal",
      trend: "0",
      color: "#8B5CF6",
      gradientFrom: "#8B5CF6",
      gradientTo: "#C4B5FD",
    },
  },

  // ── Weekly Health Chart (7 days) ──────────────────
  weeklyData: [
    { day: "Mon", heartRate: 72, bloodSugar: 90, oxygenLevel: 97 },
    { day: "Tue", heartRate: 78, bloodSugar: 92, oxygenLevel: 98 },
    { day: "Wed", heartRate: 74, bloodSugar: 88, oxygenLevel: 97 },
    { day: "Thu", heartRate: 80, bloodSugar: 95, oxygenLevel: 99 },
    { day: "Fri", heartRate: 76, bloodSugar: 91, oxygenLevel: 98 },
    { day: "Sat", heartRate: 73, bloodSugar: 89, oxygenLevel: 97 },
    { day: "Sun", heartRate: 75, bloodSugar: 95, oxygenLevel: 98 },
  ],

  // ── AI Risk Score & Recommendations ───────────────
  aiRisk: {
    score: 25, // percentage
    level: "Low",
    color: "#00A63E",
    recommendations: [
      "Maintain regular physical activity (30 min/day)",
      "Monitor blood pressure — readings are slightly low",
      "Keep blood sugar stable with balanced meals",
      "Schedule next check-up within 30 days",
    ],
  },

  // ── Appointments ──────────────────────────────────
  appointments: [
    {
      id: 1,
      doctor: "Dr. Ahmed Hassan",
      specialty: "Cardiologist",
      date: "2026-02-20",
      time: "10:00 AM",
      status: "Confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Sara Mansour",
      specialty: "General Practitioner",
      date: "2026-03-05",
      time: "02:30 PM",
      status: "Pending",
    },
  ],

  // ── Recent Activity ───────────────────────────────
  recentActivity: [
    { id: 1, action: "Vitals recorded", time: "2 hours ago", icon: "heart" },
    {
      id: 2,
      action: "Health survey submitted",
      time: "1 day ago",
      icon: "survey",
    },
    {
      id: 3,
      action: "Risk assessment updated",
      time: "3 days ago",
      icon: "risk",
    },
  ],
};

// ─────────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────────
const usePatientData = () => {
  const [patient] = useState(PATIENT_MOCK);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  return { patient, isLoading, error };
};

export default usePatientData;
