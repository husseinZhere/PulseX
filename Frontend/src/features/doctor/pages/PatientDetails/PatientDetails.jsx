import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoctorPatientProfile } from '../../../../services/doctorService';
import { downloadPatientRecordsPdf } from '../../../../services/medicalRecordService';
import { resolveFileUrl } from '../../../../utils/api';
import PatientHealthInfoSection from '../../components/Patients/PatientHealthInfoSection';
import PatientProfileHero from '../../components/Patients/PatientProfileHero';
import PatientQrSection from '../../components/Patients/PatientQrSection';
import PatientRecordsSection from '../../components/Patients/PatientRecordsSection';
import PatientVitalsSection from '../../components/Patients/PatientVitalsSection';

const normalizeRiskLevel = (riskLevel, riskScore) => {
  const raw = String(riskLevel || '').trim().toLowerCase();

  if (raw.includes('high')) return 'High';
  if (raw.includes('medium') || raw.includes('moderate')) return 'Medium';
  if (raw.includes('low')) return 'Low';

  if (typeof riskScore === 'number' && Number.isFinite(riskScore)) {
    const score = riskScore;
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  }

  return 'Unknown';
};

const resolveAvatar = (profilePicture, patientName) => {
  const resolved = resolveFileUrl(profilePicture || '');
  if (resolved) return resolved;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName || 'Patient')}&background=E2E8F0&color=334155`;
};

const mapRecordType = (recordType) => {
  const normalized = String(recordType || '').toLowerCase();
  if (normalized.includes('x-ray') || normalized.includes('xray') || normalized.includes('radiology') || normalized.includes('mri') || normalized.includes('ct')) {
    return 'Radiology';
  }
  if (normalized.includes('blood')) {
    return 'Blood Test';
  }
  return recordType || 'Medical Record';
};

const toDisplayDate = (value) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-GB');
};

const buildPublicRecordsUrl = (patientId) => {
  if (!patientId) return undefined;
  if (typeof window === 'undefined') return `/public-records/${patientId}`;
  return `${window.location.origin}/public-records/${patientId}`;
};

const sanitizeFileName = (value) => {
  const cleaned = String(value || 'patient')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_');

  return cleaned || 'patient';
};

const saveBlobAsPdf = (blob, fileName) => {
  const pdfBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

const getDownloadErrorMessage = async (err) => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.message || 'Could not download PDF.';
    } catch {
      return 'Could not download PDF.';
    }
  }

  return data?.message || err?.message || 'Could not download PDF.';
};

const asObject = (value) => (value && typeof value === 'object' ? value : null);

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
};

const getValue = (source, ...keys) => {
  const obj = asObject(source);
  if (!obj) return undefined;
  return firstNonEmpty(...keys.map((key) => obj[key]));
};

const parseNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapPatientProfile = (profile) => {
  const patientPayload = asObject(getValue(profile, 'patient', 'Patient'));
  const userPayload = asObject(firstNonEmpty(
    getValue(profile, 'user', 'User'),
    getValue(patientPayload, 'user', 'User')
  ));

  const patientName = firstNonEmpty(
    getValue(profile, 'patientName', 'PatientName', 'fullName', 'FullName', 'name', 'Name'),
    getValue(patientPayload, 'patientName', 'PatientName', 'fullName', 'FullName', 'name', 'Name'),
    getValue(userPayload, 'fullName', 'FullName', 'name', 'Name'),
    'Patient'
  );

  const riskScoreRaw = getValue(profile, 'riskScore', 'RiskScore');
  const riskScore = parseNumberOrNull(riskScoreRaw);
  const riskLevel = normalizeRiskLevel(
    getValue(profile, 'riskLevel', 'RiskLevel'),
    riskScore
  );

  const heartRateSource = asObject(getValue(profile, 'heartRate', 'HeartRate'));
  const bloodPressureSource = asObject(getValue(profile, 'bloodPressure', 'BloodPressure'));
  const bloodSugarSource = asObject(getValue(profile, 'bloodSugar', 'BloodSugar'));
  const cholesterolSource = asObject(getValue(profile, 'cholesterol', 'Cholesterol'));
  const bloodCountSource = asObject(getValue(profile, 'bloodCount', 'BloodCount'));

  const vitals = {
    heartRate: firstNonEmpty(getValue(heartRateSource, 'value', 'Value'), '--'),
    bloodPressure: firstNonEmpty(getValue(bloodPressureSource, 'value', 'Value'), '--'),
    bloodSugar: firstNonEmpty(getValue(bloodSugarSource, 'value', 'Value'), '--'),
    cholesterol: firstNonEmpty(getValue(cholesterolSource, 'value', 'Value'), '--'),
    bloodCount: firstNonEmpty(getValue(bloodCountSource, 'value', 'Value'), '--'),
  };

  const hasVitals = Object.values(vitals).some((value) => value && value !== '--');

  const medicalRecords = firstNonEmpty(
    getValue(profile, 'medicalRecords', 'MedicalRecords'),
    getValue(patientPayload, 'medicalRecords', 'MedicalRecords')
  );
  const records = Array.isArray(medicalRecords)
    ? medicalRecords.map((record, index) => ({
      id: firstNonEmpty(getValue(record, 'id', 'Id'), `record-${index}`),
      fileName: firstNonEmpty(getValue(record, 'fileName', 'FileName'), getValue(record, 'recordType', 'RecordType'), 'Medical Record'),
      type: mapRecordType(getValue(record, 'recordType', 'RecordType')),
      uploadDate: toDisplayDate(firstNonEmpty(getValue(record, 'uploadedAt', 'UploadedAt'), getValue(record, 'uploadDate', 'UploadDate'))),
      filePath: resolveFileUrl(firstNonEmpty(getValue(record, 'filePath', 'FilePath'), '')),
      uploadedAt: firstNonEmpty(getValue(record, 'uploadedAt', 'UploadedAt'), getValue(record, 'uploadDate', 'UploadDate')),
      fileSize: firstNonEmpty(getValue(record, 'fileSize', 'FileSize'), 0),
      fileType: firstNonEmpty(getValue(record, 'fileType', 'FileType'), ''),
    }))
    : [];

  const healthInfoSource = asObject(firstNonEmpty(
    getValue(profile, 'healthInformation', 'HealthInformation', 'healthInfo', 'HealthInfo'),
    getValue(patientPayload, 'healthInformation', 'HealthInformation', 'healthInfo', 'HealthInfo')
  ));
  const healthInfo = {
    height: firstNonEmpty(getValue(healthInfoSource, 'height', 'Height'), null),
    weight: firstNonEmpty(getValue(healthInfoSource, 'weight', 'Weight'), null),
    bloodPressure: firstNonEmpty(getValue(healthInfoSource, 'bloodPressure', 'BloodPressure'), hasVitals && vitals.bloodPressure !== '--' ? vitals.bloodPressure : null),
    bloodSugar: firstNonEmpty(getValue(healthInfoSource, 'bloodSugar', 'BloodSugar'), hasVitals && vitals.bloodSugar !== '--' ? vitals.bloodSugar : null),
    cholesterol: firstNonEmpty(getValue(healthInfoSource, 'cholesterol', 'Cholesterol'), hasVitals && vitals.cholesterol !== '--' ? vitals.cholesterol : null),
    bloodCount: firstNonEmpty(getValue(healthInfoSource, 'bloodCount', 'BloodCount'), hasVitals && vitals.bloodCount !== '--' ? vitals.bloodCount : null),
    heartRate: firstNonEmpty(getValue(healthInfoSource, 'heartRate', 'HeartRate'), hasVitals && vitals.heartRate !== '--' ? vitals.heartRate : null),
    lastUpdated: firstNonEmpty(getValue(healthInfoSource, 'lastUpdated', 'LastUpdated'), null),
  };

  const hasHealthInfo = [
    healthInfo.height,
    healthInfo.weight,
    healthInfo.bloodPressure,
    healthInfo.bloodSugar,
    healthInfo.cholesterol,
    healthInfo.bloodCount,
    healthInfo.heartRate,
  ].some((value) => value !== null && value !== undefined && value !== '');

  const lastVisitRelative = getValue(profile, 'lastVisitRelative', 'LastVisitRelative');
  const lastVisitDate = getValue(profile, 'lastVisit', 'LastVisit', 'lastVisitDate', 'LastVisitDate');
  const patientId = firstNonEmpty(
    getValue(profile, 'patientId', 'PatientId', 'id', 'Id'),
    getValue(patientPayload, 'patientId', 'PatientId', 'id', 'Id')
  );
  const qrCodeValue = firstNonEmpty(
    buildPublicRecordsUrl(patientId),
    getValue(profile, 'qrCodeData', 'QRCodeData'),
    getValue(patientPayload, 'qrCodeData', 'QRCodeData')
  );

  return {
    id: patientId,
    patientCode: firstNonEmpty(
      getValue(profile, 'patientCode', 'PatientCode'),
      getValue(patientPayload, 'patientCode', 'PatientCode', 'patientId', 'PatientId'),
      ''
    ),
    name: patientName,
    email: firstNonEmpty(
      getValue(profile, 'email', 'Email', 'userEmail', 'UserEmail'),
      getValue(userPayload, 'email', 'Email'),
      ''
    ),
    phoneNumber: firstNonEmpty(
      getValue(profile, 'phoneNumber', 'PhoneNumber', 'phone', 'Phone'),
      getValue(userPayload, 'phoneNumber', 'PhoneNumber', 'phone', 'Phone'),
      ''
    ),
    dateOfBirth: firstNonEmpty(
      getValue(profile, 'dateOfBirth', 'DateOfBirth'),
      getValue(patientPayload, 'dateOfBirth', 'DateOfBirth'),
      getValue(userPayload, 'dateOfBirth', 'DateOfBirth'),
      null
    ),
    location: firstNonEmpty(
      getValue(profile, 'location', 'Location'),
      getValue(patientPayload, 'location', 'Location'),
      ''
    ),
    about: firstNonEmpty(
      getValue(profile, 'about', 'About'),
      getValue(patientPayload, 'about', 'About'),
      ''
    ),
    age: firstNonEmpty(
      parseNumberOrNull(getValue(profile, 'age', 'Age')),
      parseNumberOrNull(getValue(patientPayload, 'age', 'Age')),
      0
    ),
    gender: firstNonEmpty(
      getValue(profile, 'gender', 'Gender'),
      getValue(patientPayload, 'gender', 'Gender'),
      'Unknown'
    ),
    riskLevel,
    riskScore,
    riskAssessedAt: firstNonEmpty(getValue(profile, 'riskAssessedAt', 'RiskAssessedAt'), null),
    visitType: firstNonEmpty(getValue(profile, 'visitType', 'VisitType'), ''),
    chatExpired: firstNonEmpty(getValue(profile, 'chatStatus', 'ChatStatus'), ''),
    lastVisit: firstNonEmpty(lastVisitRelative, toDisplayDate(lastVisitDate)),
    avatar: resolveAvatar(
      firstNonEmpty(
        getValue(profile, 'profilePicture', 'ProfilePicture', 'avatar', 'Avatar', 'avatarUrl', 'AvatarUrl'),
        getValue(userPayload, 'profilePicture', 'ProfilePicture', 'avatar', 'Avatar', 'avatarUrl', 'AvatarUrl'),
        ''
      ),
      patientName
    ),
    vitals: hasVitals ? vitals : null,
    records,
    qrCodeValue,
    qrCodeGeneratedAt: firstNonEmpty(
      getValue(profile, 'qrCodeGeneratedAt', 'QRCodeGeneratedAt'),
      getValue(patientPayload, 'qrCodeGeneratedAt', 'QRCodeGeneratedAt'),
      records.length > 0 ? new Date().toISOString() : null
    ),
    totalFilesCount: firstNonEmpty(
      parseNumberOrNull(getValue(profile, 'totalFilesCount', 'TotalFilesCount')),
      parseNumberOrNull(getValue(patientPayload, 'totalFilesCount', 'TotalFilesCount')),
      records.length
    ),
    healthInfo: hasHealthInfo ? healthInfo : null,
  };
};

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      if (!id) {
        setError('Invalid patient id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setDownloadError('');

      try {
        const response = await getDoctorPatientProfile(id);
        if (ignore) return;
        setPatient(mapPatientProfile(response));
      } catch (err) {
        if (ignore) return;
        setError(err?.response?.data?.message || 'Could not load patient data.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProfile();
    return () => { ignore = true; };
  }, [id]);

  useEffect(() => {
    document.title = patient?.name ? `${patient.name} | Patient Details` : 'Patient Details | PulseX Doctor';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Doctor patient details page with vital signs, records, and QR summary.');
    }
  }, [patient?.name]);

  const handleDownloadPdf = async () => {
    if (!patient?.id) return;

    setIsDownloadingPdf(true);
    setDownloadError('');

    try {
      const pdfBlob = await downloadPatientRecordsPdf(patient.id);
      const fileName = `PulseX_${sanitizeFileName(patient.name)}_MedicalRecords.pdf`;
      saveBlobAsPdf(pdfBlob, fileName);
    } catch (err) {
      setDownloadError(await getDownloadErrorMessage(err));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-full p-6 sm:p-8" aria-label="Patient details loading">
        <div className="animate-pulse space-y-4">
          <div className="h-28 rounded-3xl bg-[#E5E7EB]" />
          <div className="h-40 rounded-2xl bg-[#E5E7EB]" />
          <div className="h-52 rounded-2xl bg-[#E5E7EB]" />
        </div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="min-h-full p-6 sm:p-8" aria-label="Patient details error">
        <section className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
          <h1 className="text-[20px] font-bold text-[#991B1B]">Unable to load patient record</h1>
          <p className="mt-2 text-[15px] text-[#B91C1C]">{error || 'Patient was not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/doctor/patients')}
            className="mt-4 h-10 rounded-full bg-[#333CF5] px-5 text-[14px] font-semibold text-white"
          >
            Back to Patient List
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-full p-6 sm:p-8" aria-label="Patient details page">
      <div className="w-full flex flex-col gap-6">
        <PatientProfileHero
          patient={patient}
          onAddMedical={() => navigate(`/doctor/patients/${patient.id}/medical-records/new`)}
          onAddPrescription={() => navigate(`/doctor/prescription?patientId=${patient.id}`)}
          onMessage={() => navigate('/doctor/messages')}
        />

        <PatientVitalsSection
          patient={patient}
          onAddVitals={() => navigate(`/doctor/patients/${patient.id}/medical-records/new`)}
        />

        <PatientHealthInfoSection patient={patient} />

        <PatientRecordsSection patient={patient} />
        {(patient.records.length > 0 || patient.totalFilesCount > 0) ? (
          <PatientQrSection patient={patient} />
        ) : null}
      </div>
    </main>
  );
};

export default PatientDetails;
