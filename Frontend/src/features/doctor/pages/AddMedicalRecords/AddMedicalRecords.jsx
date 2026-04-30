import { useEffect, useState } from 'react';
import { HiOutlineCheck } from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../../../admin/components/ConfirmModal/ConfirmModal';
import StatusToast from '../../components/SettingsProfile/StatusToast';
import HealthMeasurementsSection from '../../components/Patients/HealthMeasurementsSection';
import MedicalMetricsSection from '../../components/Patients/MedicalMetricsSection';
import PatientInfoCompactCard from '../../components/Patients/PatientInfoCompactCard';
import { getDoctorPatientProfile, addPatientMedicalData } from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';
import {
  coerceHealthMetricSelection,
  getHealthMetricStorageValue,
} from '../../../../utils/healthMetrics';

/* Extract a numeric string from a VitalSignDto-like object or direct value */
const extractValue = (...sources) => {
  for (const s of sources) {
    if (s === null || s === undefined) continue;
    if (typeof s === 'object' && s.value != null) return String(s.value);
    if (typeof s === 'object' && s.Value != null) return String(s.Value);
    if (typeof s === 'string' && s.trim()) return s;
    if (typeof s === 'number') return String(s);
  }
  return '';
};

const AddMedicalRecords = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [healthForm, setHealthForm] = useState({ temperature: '', bloodSugar: '', height: '', weight: '' });
  const [medicalForm, setMedicalForm] = useState({ heartRate: '', bloodPressure: '', bloodCount: '', cholesterol: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  /* Load patient profile & pre-fill existing data */
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const profile = await getDoctorPatientProfile(id);
        if (ignore) return;

        const hi = profile.healthInformation || profile.HealthInformation || {};
        const avatarRaw = profile.profilePicture || profile.ProfilePicture || '';
        const avatarUrl = avatarRaw
          ? resolveFileUrl(avatarRaw)
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.patientName || profile.PatientName || 'P')}&background=E2E8F0&color=334155`;

        setPatient({
          id: profile.patientId || profile.PatientId || id,
          name: profile.patientName || profile.PatientName || 'Patient',
          age: profile.age || profile.Age || '--',
          gender: profile.gender || profile.Gender || 'Unknown',
          riskLevel: profile.riskLevel || profile.RiskLevel || 'Unknown',
          avatar: avatarUrl,
        });

        // Pre-fill health form from existing data
        setHealthForm({
          temperature: extractValue(profile.bodyTemperature, profile.BodyTemperature, hi.bodyTemperature, hi.BodyTemperature),
          bloodSugar: extractValue(profile.bloodSugar, profile.BloodSugar, hi.bloodSugar, hi.BloodSugar),
          height: extractValue(hi.height, hi.Height, profile.height, profile.Height),
          weight: extractValue(hi.weight, hi.Weight, profile.weight, profile.Weight),
        });

        // Pre-fill medical form from existing data
        setMedicalForm({
          heartRate: coerceHealthMetricSelection('heartRate', extractValue(profile.heartRate, profile.HeartRate, hi.heartRate, hi.HeartRate)),
          bloodPressure: coerceHealthMetricSelection('bloodPressure', extractValue(profile.bloodPressure, profile.BloodPressure, hi.bloodPressure, hi.BloodPressure)),
          bloodCount: coerceHealthMetricSelection('bloodCount', extractValue(profile.bloodCount, profile.BloodCount, hi.bloodCount, hi.BloodCount)),
          cholesterol: extractValue(profile.cholesterol, profile.Cholesterol, hi.cholesterol, hi.Cholesterol),
        });
      } catch (err) {
        if (!ignore) setError(err?.response?.data?.message || 'Failed to load patient data.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => {
    document.title = 'Add Medical Records | PulseX Doctor';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Doctor form to add patient health and medical metrics records.');
    }
  }, []);

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timer = setTimeout(() => setToastVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    setError('');
    try {
      const payload = {
        bodyTemperature: healthForm.temperature ? parseFloat(healthForm.temperature) : null,
        bloodSugar: healthForm.bloodSugar ? parseFloat(healthForm.bloodSugar) : null,
        height: healthForm.height ? parseFloat(healthForm.height) : null,
        weight: healthForm.weight ? parseFloat(healthForm.weight) : null,
        heartRate: medicalForm.heartRate ? getHealthMetricStorageValue('heartRate', medicalForm.heartRate) : null,
        bloodPressure: medicalForm.bloodPressure ? getHealthMetricStorageValue('bloodPressure', medicalForm.bloodPressure) : null,
        bloodCount: medicalForm.bloodCount ? getHealthMetricStorageValue('bloodCount', medicalForm.bloodCount) : null,
        cholesterol: medicalForm.cholesterol ? parseFloat(medicalForm.cholesterol) : null,
      };
      await addPatientMedicalData(id, payload);
      setToastVisible(true);
      setTimeout(() => navigate(`/doctor/patients/${id}`), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save medical data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-full p-6 sm:p-8 flex items-center justify-center">
        <p className="text-brand-main font-bold text-[16px] animate-pulse">Loading patient data...</p>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="min-h-full p-6 sm:p-8">
        <section className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
          <h1 className="text-[20px] font-bold text-[#991B1B]">Patient Not Found</h1>
          <p className="mt-2 text-[15px] text-[#B91C1C]">{error || 'Could not load patient profile.'}</p>
          <button
            type="button"
            onClick={() => navigate('/doctor/patients')}
            className="mt-4 h-10 rounded-full bg-[#333CF5] px-5 text-[14px] font-semibold text-white cursor-pointer"
          >
            Back to Patients
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-full p-6 sm:p-8" aria-label="Add medical records page">
      <StatusToast visible={toastVisible} title="Saved Successfully" message="Medical records have been saved to the patient's profile." />
      <ConfirmModal
        isOpen={confirmOpen}
        title="Save Medical Records?"
        desc="Are you sure you want to save these medical records for this patient? Changes will be reflected on the patient's profile."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSave}
      />

      <div className="w-full space-y-6">
        <PatientInfoCompactCard patient={patient} />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <HealthMeasurementsSection
          values={healthForm}
          onChange={(key, value) => setHealthForm((state) => ({ ...state, [key]: value }))}
        />
        <MedicalMetricsSection
          values={medicalForm}
          onChange={(key, value) => setMedicalForm((state) => ({ ...state, [key]: value }))}
        />

        <section className="flex justify-end gap-3" aria-label="Form actions">
          <button
            type="button"
            onClick={() => navigate(`/doctor/patients/${id}`)}
            className="cursor-pointer h-11 rounded-full border border-[#D1D5DB] bg-[#F3F4F6] dark:bg-[#1E293B] dark:text-gray-300 px-6 text-[14px] font-semibold text-[#374151]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => setConfirmOpen(true)}
            className="cursor-pointer inline-flex h-11 items-center gap-1 rounded-full bg-[#333CF5] px-6 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(51,60,245,0.35)] disabled:opacity-60"
          >
            <HiOutlineCheck className="text-[15px]" />
            {saving ? 'Saving...' : 'Save Medical Records'}
          </button>
        </section>
      </div>
    </main>
  );
};

export default AddMedicalRecords;
