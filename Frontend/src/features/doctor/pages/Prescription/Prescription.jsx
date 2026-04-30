import { useEffect, useMemo, useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import { useSearchParams } from 'react-router-dom';
import ClinicalNotesSection from '../../components/Prescription/ClinicalNotesSection';
import LabRadiologySection from '../../components/Prescription/LabRadiologySection';
import MedicationEntrySection from '../../components/Prescription/MedicationEntrySection';
import PatientInformationSection from '../../components/Prescription/PatientInformationSection';
import PrescriptionConfirmModal from '../../components/Prescription/PrescriptionConfirmModal';
import PrescriptionHeader from '../../components/Prescription/PrescriptionHeader';
import PrescriptionSuccessToast from '../../components/Prescription/PrescriptionSuccessToast';
import { createPrescription } from '../../../../services/prescriptionService';
import { getDoctorPatients, getDoctorPatientProfile } from '../../../../services/doctorService';
import { resolveFileUrl } from '../../../../utils/api';

const INITIAL_MEDICATION = { id: 1, drugName: '', dosage: '', frequency: '', duration: '' };
const INITIAL_REQUEST = { id: 1, testName: '', notes: '' };

const PATIENT_OPTIONS = [];

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
};

const extractPatientIdFromInput = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const direct = Number(raw);
  if (Number.isFinite(direct) && direct > 0) {
    return direct;
  }

  const matched = raw.match(/(\d+)\s*$/);
  if (!matched) return null;

  const parsed = Number(matched[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const Prescription = () => {
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatientFromQuery, setSelectedPatientFromQuery] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medications, setMedications] = useState([INITIAL_MEDICATION]);
  const [requests, setRequests] = useState([INITIAL_REQUEST]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const patients = await getDoctorPatients();
        const list = Array.isArray(patients) ? patients : (patients?.items || []);
        if (ignore) return;
        const options = list.map((p) => ({
          id: String(firstNonEmpty(p.patientId, p.PatientId, p.id, p.Id, '')),
          name: firstNonEmpty(p.patientName, p.PatientName, p.fullName, p.FullName, p.name, p.Name, ''),
        }));
        setPatientOptions(options);
        
        if (patientIdParam) {
          try {
            const profileData = await getDoctorPatientProfile(patientIdParam);
            if (ignore) return;
            const profile = profileData?.patient || profileData || {};
            const userPayload = profileData?.user || profile?.user || {};
            
            const resolvedPatientId = String(
              firstNonEmpty(profile.id, profile.Id, profile.patientId, profile.PatientId, patientIdParam)
            );
            const patientName = firstNonEmpty(
              profile.patientName,
              profile.PatientName,
              profile.fullName,
              profile.FullName,
              profile.name,
              profile.Name,
              userPayload.fullName,
              userPayload.FullName,
              'Patient'
            );
            const rawAvatar = firstNonEmpty(
              profile.profilePicture,
              profile.ProfilePicture,
              profile.avatar,
              profile.Avatar,
              userPayload.profilePicture,
              userPayload.ProfilePicture
            );
            const avatarUrl = rawAvatar ? resolveFileUrl(rawAvatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=E2E8F0&color=334155`;
            
            setSelectedPatientFromQuery({
              id: resolvedPatientId,
              name: patientName,
              gender: firstNonEmpty(profile.gender, profile.Gender, 'Unknown'),
              age: firstNonEmpty(profile.age, profile.Age, '--'),
              visitType: firstNonEmpty(profile.visitType, profile.VisitType, 'General Visit'),
              avatar: avatarUrl
            });
            setSelectedPatient(resolvedPatientId);
          } catch (profileError) {
            console.error('Failed to load specific patient profile', profileError);
            const found = list.find((p) =>
              String(firstNonEmpty(p.patientId, p.PatientId, p.id, p.Id, '')) === patientIdParam
            );
            if (found) {
              const id = String(firstNonEmpty(found.patientId, found.PatientId, found.id, found.Id, patientIdParam));
              const name = firstNonEmpty(found.patientName, found.PatientName, found.fullName, found.FullName, found.name, found.Name, 'Patient');
              setSelectedPatientFromQuery({
                id,
                name: name,
                gender: firstNonEmpty(found.gender, found.Gender, 'Unknown'),
                age: firstNonEmpty(found.age, found.Age, '--'),
                visitType: firstNonEmpty(found.visitType, found.VisitType, 'General Visit'),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2E8F0&color=334155`
              });
              setSelectedPatient(id);
            }
          }
        }
      } catch (err) {
        console.error('Load prescription form failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, [patientIdParam]);

  useEffect(() => {
    document.title = 'New E-Prescription | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Doctor page to create and send e-prescriptions with medications, lab requests, and clinical notes.');
    }
  }, []);

  useEffect(() => {
    if (!successVisible) return undefined;
    const timer = setTimeout(() => setSuccessVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [successVisible]);

  const canSend = useMemo(() => {
    const selectedId = extractPatientIdFromInput(selectedPatientFromQuery?.id || selectedPatient);
    const hasPatient = Number.isFinite(selectedId) && selectedId > 0;
    const hasMedication = medications.some(
      (item) => item.drugName.trim() && item.dosage.trim() && item.frequency.trim()
    );
    return hasPatient && hasMedication;
  }, [selectedPatient, medications, selectedPatientFromQuery]);

  const handleAddMedication = () => {
    setMedications((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1;
      return [...prev, { id: nextId, drugName: '', dosage: '', frequency: '', duration: '' }];
    });
  };

  const handleRemoveMedication = (id) => {
    setMedications((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handleMedicationChange = (id, field, value) => {
    setMedications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddRequest = () => {
    setRequests((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1;
      return [...prev, { id: nextId, testName: '', notes: '' }];
    });
  };

  const handleRemoveRequest = (id) => {
    setRequests((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handleRequestChange = (id, field, value) => {
    setRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleClickSend = () => {
    if (!canSend) {
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    setConfirmOpen(false);
    setError('');
    try {
      const resolvedPatientId = extractPatientIdFromInput(selectedPatientFromQuery?.id || selectedPatient);
      if (!resolvedPatientId) {
        setError('Please select a valid patient.');
        return;
      }

      const payload = {
        patient_id: resolvedPatientId,
        medications: medications.filter((m) => m.drugName).map((m) => ({
          drug_name: m.drugName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
        })),
        lab_requests: requests.filter((r) => r.testName).map((r) => ({
          test_name: r.testName,
          additional_notes: r.notes,
          is_fasting_required: false,
        })),
        clinical_notes: clinicalNotes,
      };
      await createPrescription(payload);
      setSuccessVisible(true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send prescription');
    }
  };

  return (
    <main className="min-h-full p-6 sm:p-8">
      <PrescriptionSuccessToast visible={successVisible} />
      <PrescriptionConfirmModal
        isOpen={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSend}
      />

      <div className="w-full flex-col flex gap-4">
        <PrescriptionHeader />

        <section className="mt-6 space-y-4 sm:space-y-5">
          <PatientInformationSection
            selectedPatient={selectedPatient}
            onPatientChange={setSelectedPatient}
            patientOptions={patientOptions.length ? patientOptions : PATIENT_OPTIONS}
            selectedPatientDetails={selectedPatientFromQuery}
          />
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <MedicationEntrySection
            medications={medications}
            onAddMedication={handleAddMedication}
            onRemoveMedication={handleRemoveMedication}
            onMedicationChange={handleMedicationChange}
          />

          <LabRadiologySection
            requests={requests}
            onAddRequest={handleAddRequest}
            onRemoveRequest={handleRemoveRequest}
            onRequestChange={handleRequestChange}
          />

          <ClinicalNotesSection value={clinicalNotes} onChange={setClinicalNotes} />
        </section>

        <section className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClickSend}
            className="cursor-pointer inline-flex items-center gap-[8px] rounded-[24px] bg-[#333CF5] px-[18px] py-[12px] text-[16px] font-bold text-white shadow-[0px_4px_12px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#2C34D8]"
          >
            <HiOutlinePaperAirplane className="text-[20px] -rotate-45 mb-1" />
            Send to Patient
          </button>
        </section>
      </div>
    </main>
  );
};

export default Prescription;
