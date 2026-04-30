export const PATIENTS = [
  {
    id: 'pt-1',
    name: 'Sara Kamel',
    age: 34,
    gender: 'Female',
    visitType: 'Online',
    chatExpired: '3 days left',
    riskLevel: 'Low',
    riskColor: 'green',
    lastVisit: '2 days ago',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    vitals: null,
    records: [],
  },
  {
    id: 'pt-2',
    name: 'Ali Mohamed',
    age: 45,
    gender: 'Male',
    visitType: 'Online',
    chatExpired: '1 day left',
    riskLevel: 'High',
    riskColor: 'red',
    lastVisit: '1 week ago',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    vitals: null,
    records: [],
  },
  {
    id: 'pt-3',
    name: 'Yousra Adel',
    age: 32,
    gender: 'Female',
    visitType: 'Clinic',
    chatExpired: 'Open Chat',
    riskLevel: 'Low Risk',
    riskColor: 'green',
    lastVisit: 'Today',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    vitals: {
      heartRate: '72',
      bloodPressure: '120/80',
      bloodSugar: '95',
      cholesterol: '180',
      bloodCount: 'Normal',
    },
    records: [
      { id: 'r1', fileName: 'Complete Blood Count', type: 'Blood Test', uploadDate: 'Oct 28, 2024' },
      { id: 'r2', fileName: 'Chest X-Ray', type: 'Radiology', uploadDate: 'Oct 25, 2024' },
      { id: 'r3', fileName: 'Lipid Panel', type: 'Blood Test', uploadDate: 'Oct 20, 2024' },
    ],
  },
  {
    id: 'pt-4',
    name: 'Waled Omar',
    age: 52,
    gender: 'Male',
    visitType: 'Online',
    chatExpired: '2 days left',
    riskLevel: 'Low',
    riskColor: 'green',
    lastVisit: '3 days ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    vitals: null,
    records: [],
  },
  {
    id: 'pt-5',
    name: 'Soha Ali',
    age: 39,
    gender: 'Female',
    visitType: 'Clinic',
    chatExpired: '3 days left',
    riskLevel: 'Moderate',
    riskColor: 'yellow',
    lastVisit: '1 day ago',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    vitals: null,
    records: [],
  },
];

export const getRiskClass = (riskLevel) => {
  const normalized = String(riskLevel || '').toLowerCase();

  if (normalized.includes('high')) return 'bg-[#FEE2E2] text-[#B91C1C]';
  if (normalized.includes('medium') || normalized.includes('moderate')) return 'bg-[#FEF3C7] text-[#92400E]';
  if (normalized.includes('unknown')) return 'bg-[#E5E7EB] text-[#4B5563]';

  return 'bg-[#DCFCE7] text-[#166534]';
};

export const findPatientById = (id) => PATIENTS.find((patient) => patient.id === id) || PATIENTS[0];
