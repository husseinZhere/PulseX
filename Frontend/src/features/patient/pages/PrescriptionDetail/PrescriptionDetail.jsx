import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ClinicalNotesSection from '../../components/PrescriptionDetail/ClinicalNotesSection';
import LabsSection from '../../components/PrescriptionDetail/LabsSection';
import MedicationsSection from '../../components/PrescriptionDetail/MedicationsSection';
import PrescriptionDetailHeader from '../../components/PrescriptionDetail/PrescriptionDetailHeader';
import { getPrescriptionDetails } from '../../../../services/prescriptionService';
import { generatePrescriptionPDF } from '../Prescriptions/Prescriptions';
import { getStoredUser, resolveFileUrl } from '../../../../utils/api';

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
};

const toDateTime = (createdAt, formattedDate, formattedTime) => {
  const parsed = createdAt ? new Date(createdAt) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return {
      date: parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return {
    date: formattedDate || 'Not available',
    time: formattedTime || '',
  };
};

const mapMedication = (med) => ({
  name: firstNonEmpty(med?.drugName, med?.DrugName, med?.name, med?.drug_name, 'Unnamed medication'),
  dose: firstNonEmpty(med?.dosage, med?.Dosage, med?.dose, 'Not specified'),
  freq: firstNonEmpty(med?.displayFrequency, med?.DisplayFrequency, med?.frequency, med?.Frequency, med?.freq, 'Not specified'),
  dur: firstNonEmpty(med?.duration, med?.Duration, med?.dur, 'Not specified'),
});

const mapLab = (lab, index) => ({
  id: String(firstNonEmpty(lab?.id, lab?.Id, `lab-${index + 1}`)),
  name: firstNonEmpty(lab?.testName, lab?.TestName, lab?.name, lab?.test_name, 'Lab request'),
  note: firstNonEmpty(
    lab?.additionalNotes,
    lab?.AdditionalNotes,
    lab?.instructions,
    lab?.Instructions,
    lab?.note,
    ''
  ),
});

const mapPrescriptionDetails = (apiData, fallbackState) => {
  const data = apiData || fallbackState || {};
  const user = getStoredUser() || {};
  const createdAt = firstNonEmpty(data.createdAt, data.CreatedAt, fallbackState?.createdAt);
  const { date, time } = toDateTime(
    createdAt,
    firstNonEmpty(data.formattedDate, data.FormattedDate, fallbackState?.date),
    firstNonEmpty(data.formattedTime, data.FormattedTime, fallbackState?.time)
  );

  const meds = firstNonEmpty(data.medications, data.Medications, fallbackState?.medications, []);
  const labs = firstNonEmpty(data.labRequests, data.LabRequests, data.labs, data.Labs, fallbackState?.labs, []);

  return {
    id: String(firstNonEmpty(data.id, data.Id, fallbackState?.id, '')),
    refId: String(firstNonEmpty(data.prescriptionId, data.PrescriptionId, fallbackState?.refId, fallbackState?.id, '')),
    doc: firstNonEmpty(data.doctorName, data.DoctorName, fallbackState?.doc, 'Doctor'),
    spec: firstNonEmpty(data.doctorSpecialization, data.DoctorSpecialization, fallbackState?.spec, ''),
    doctorAvatar: resolveFileUrl(firstNonEmpty(data.doctorProfilePicture, data.DoctorProfilePicture, fallbackState?.doctorAvatar, '')),
    patientName: firstNonEmpty(data.patientName, data.PatientName, fallbackState?.patientName, user.fullName, user.FullName, 'Patient'),
    patientID: String(firstNonEmpty(data.patientIdNumber, data.PatientIdNumber, data.patientId, data.PatientId, fallbackState?.patientID, '')),
    patientAvatar: resolveFileUrl(firstNonEmpty(data.patientProfilePicture, data.PatientProfilePicture, fallbackState?.patientAvatar, user.profilePicture, user.ProfilePicture, '')),
    date,
    time,
    status: firstNonEmpty(data.status, data.Status, fallbackState?.status, 'Active'),
    medications: Array.isArray(meds) ? meds.map(mapMedication) : [],
    labs: Array.isArray(labs) ? labs.map(mapLab) : [],
    instructions: firstNonEmpty(data.importantInstructions, data.ImportantInstructions, fallbackState?.instructions, ''),
    labInstructions: firstNonEmpty(data.labInstructions, data.LabInstructions, fallbackState?.labInstructions, ''),
    clinicalNotes: firstNonEmpty(data.clinicalNotes, data.ClinicalNotes, fallbackState?.clinicalNotes, 'No clinical notes.'),
  };
};

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Prescription Details | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Review prescription details, lab requests, and clinical notes.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    const fromState = location.state?.prescription;

    const load = async () => {
      try {
        const details = await getPrescriptionDetails(id);
        if (ignore) return;
        setData(mapPrescriptionDetails(details, fromState));
      } catch (err) {
        if (ignore) return;
        if (fromState) {
          setData(mapPrescriptionDetails(null, fromState));
        } else {
          setError(err?.response?.data?.message || 'Could not load prescription details.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => { ignore = true; };
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#0B1120] flex items-center justify-center">
        <p className="text-brand-main font-bold text-[16px] animate-pulse">Loading prescription...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#111827] rounded-[22px] p-4 sm:p-6">
        <section className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
          <h1 className="text-[20px] font-bold text-[#991B1B]">Unable to load prescription</h1>
          <p className="mt-2 text-[15px] text-[#B91C1C]">{error || 'Prescription not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/patient/prescription')}
            className="mt-4 h-10 rounded-full bg-[#333CF5] px-5 text-[14px] font-semibold text-white"
          >
            Back to Prescriptions
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#111827] rounded-[22px] p-4 sm:p-6">
      <h1 className="sr-only">Prescription Details</h1>

      <article className="rounded-[24px] overflow-hidden mx-auto w-full">
        <PrescriptionDetailHeader data={data} onDownload={generatePrescriptionPDF} />

        <div className="p-4 sm:p-8 flex flex-col gap-8">
          <MedicationsSection data={data} />
          <LabsSection data={data} onUpload={() => navigate('/patient/records')} />
          <ClinicalNotesSection data={data} />
        </div>
      </article>

      <footer className="sr-only">
        <p>End of prescription details.</p>
      </footer>
    </main>
  );
};

export default PrescriptionDetail;
