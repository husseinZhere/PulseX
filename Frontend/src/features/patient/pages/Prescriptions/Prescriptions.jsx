import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import PrescriptionsGrid from '../../components/Prescriptions/PrescriptionsGrid';
import PrescriptionsHeader from '../../components/Prescriptions/PrescriptionsHeader';
import SearchFilterBar from '../../components/Prescriptions/SearchFilterBar';
import StatsRow from '../../components/Prescriptions/StatsRow';
import { getStoredUser, resolveFileUrl } from '../../../../utils/api';

export const ALL_PRESCRIPTIONS = [
  {
    id: 'RX-2026-0210-4523', doc: 'Dr. Sarah Mitchell', spec: 'Internal Medicine',
    date: 'February 10, 2026', time: '10:00 AM', status: 'Active',
    patientName: 'John Anderson', patientID: 'PX-2024-7891',
    medications: [
      { name: 'Amoxicillin 500mg', dose: '500mg', freq: '3 times daily (after meals)', dur: '7 days' },
      { name: 'Paracetamol', dose: '500mg', freq: 'Every 6 hours as needed', dur: '5 days' },
      { name: 'Vitamin D3', dose: '1000 IU', freq: 'Once daily', dur: '30 days' },
    ],
    instructions: 'Take all medications as prescribed. Complete the full course of antibiotics even if you feel better.',
    labs: [
      { id: 'l1', name: 'Complete Blood Count (CBC)', note: 'Fasting required - 8-12 hours' },
      { id: 'l2', name: 'Lipid Profile', note: 'Fasting required' },
    ],
    labInstructions: 'Please visit the lab with this prescription. Bring your ID and insurance card.',
    clinicalNotes: 'Patient presents with mild upper respiratory infection. Ensure adequate rest and hydration. Follow up in 1 week if symptoms persist.',
  },
  {
    id: 'RX-2026-0205-3891', doc: 'Dr. Michael Chen', spec: 'Cardiology',
    date: 'February 5, 2026', time: '9:15 AM', status: 'Active',
    patientName: 'John Anderson', patientID: 'PX-2024-7891',
    medications: [
      { name: 'Atorvastatin 20mg', dose: '20mg', freq: 'Once daily at bedtime', dur: '90 days' },
      { name: 'Aspirin 81mg', dose: '81mg', freq: 'Once daily with food', dur: '90 days' },
    ],
    instructions: 'Do not stop medication without consulting your cardiologist. Monitor blood pressure daily.',
    labs: [
      { id: 'l1', name: 'Echocardiogram', note: 'Schedule appointment at cardiac unit' },
    ],
    labInstructions: 'Bring all previous cardiac reports to the appointment.',
    clinicalNotes: 'Patient with elevated LDL and mild hypertension. Started on statins. Lifestyle modification advised — low sodium diet and 30 min daily walk.',
  },
  {
    id: 'RX-2026-0128-2147', doc: 'Dr. Emily Rodriguez', spec: 'Dermatology',
    date: 'January 28, 2026', time: '3:00 PM', status: 'Completed',
    patientName: 'John Anderson', patientID: 'PX-2024-7891',
    medications: [
      { name: 'Hydrocortisone Cream 1%', dose: 'Topical', freq: 'Apply twice daily on affected area', dur: '14 days' },
    ],
    instructions: 'Avoid direct sun exposure on treated areas. Do not use on face unless directed.',
    labs: [],
    labInstructions: '',
    clinicalNotes: 'Mild eczema flare-up on forearms. Topical corticosteroid prescribed. Follow up in 2 weeks or earlier if condition worsens.',
  },
  {
    id: 'RX-2026-0115-1623', doc: 'Dr. James Anderson', spec: 'Orthopedics',
    date: 'January 15, 2026', time: '11:30 AM', status: 'Completed',
    patientName: 'John Anderson', patientID: 'PX-2024-7891',
    medications: [
      { name: 'Ibuprofen 400mg', dose: '400mg', freq: 'Every 8 hours with food', dur: '10 days' },
      { name: 'Calcium + Vit D', dose: '600mg', freq: 'Once daily with breakfast', dur: '60 days' },
      { name: 'Muscle Relaxant', dose: '5mg', freq: 'At bedtime', dur: '7 days' },
      { name: 'Topical Diclofenac', dose: 'Topical', freq: 'Apply 3 times daily on knee', dur: '14 days' },
    ],
    instructions: 'Avoid strenuous activity. Use knee brace when walking. Ice the knee 20 min twice daily.',
    labs: [
      { id: 'l1', name: 'Knee X-Ray (AP & Lateral)', note: '' },
      { id: 'l2', name: 'MRI Right Knee', note: 'No metal implants' },
      { id: 'l3', name: 'Bone Density Scan (DEXA)', note: 'Fasting not required' },
    ],
    labInstructions: 'Bring referral letter. MRI appointment must be booked in advance.',
    clinicalNotes: 'Patient with right knee pain following sports injury. Moderate joint effusion noted. Conservative management initiated. Surgery evaluation if no improvement in 6 weeks.',
  },
  {
    id: 'RX-2025-1220-8934', doc: 'Dr. Lisa Thompson', spec: 'Neurology',
    date: 'December 20, 2025', time: '2:00 PM', status: 'Completed',
    patientName: 'John Anderson', patientID: 'PX-2024-7891',
    medications: [
      { name: 'Sumatriptan 50mg', dose: '50mg', freq: 'At onset of migraine, max 2/day', dur: '30 days' },
      { name: 'Propranolol 40mg', dose: '40mg', freq: 'Twice daily', dur: '60 days' },
    ],
    instructions: 'Keep a migraine diary. Avoid known triggers (bright lights, stress, certain foods).',
    labs: [
      { id: 'l1', name: 'MRI Brain with contrast', note: 'No metal implants' },
      { id: 'l2', name: 'EEG', note: 'Avoid caffeine 24h before test' },
    ],
    labInstructions: 'Schedule MRI and EEG on separate days. Bring previous imaging if available.',
    clinicalNotes: 'Recurrent migraines with visual aura, 3-4 episodes per month. Prophylactic beta-blocker therapy started. Patient educated on trigger avoidance.',
  },
  {
    id: 'RX-2025-1210-7421', doc: 'Dr. Robert Kumar', spec: 'General Practice',
    date: 'December 10, 2025', time: '8:45 AM', status: 'Completed',
    patientName: 'John Anderson', patientID: 'PX-2024-7891',
    medications: [
      { name: 'Cetirizine 10mg', dose: '10mg', freq: 'Once daily at night', dur: '14 days' },
      { name: 'Fluticasone Spray', dose: '50mcg', freq: '2 sprays each nostril/day', dur: '30 days' },
    ],
    instructions: 'Avoid allergens. Use nasal spray consistently even if symptoms improve.',
    labs: [
      { id: 'l1', name: 'Allergy Panel (IgE)', note: 'Fasting not required' },
    ],
    labInstructions: 'Blood draw — no special preparation needed.',
    clinicalNotes: 'Seasonal allergic rhinitis. Antihistamine and nasal corticosteroid prescribed. Allergen testing ordered to identify specific triggers.',
  },
];

export async function generatePrescriptionPDF(item) {
  const BLUE = [51, 60, 245];
  const DKBLUE = [1, 2, 24];
  const GRAY = [107, 114, 128];
  const LGRAY = [243, 244, 246];
  const WHITE = [255, 255, 255];
  const GREEN = [22, 163, 74];
  const isActive = item.status === 'Active';

  let logoDataUrl = null;
  try {
    const res = await fetch('/logo/logo.svg');
    const blob = await res.blob();
    logoDataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (_) { }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 12;

  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 38, 'F');
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'SVG', ML, 7, 24, 24); } catch (_) { }
  }
  doc.setFontSize(17); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
  doc.text('PulseX', ML + 28, 18);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 210, 255);
  doc.text('Your Trusted Health Platform', ML + 28, 25);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
  doc.text('MEDICAL PRESCRIPTION', W - ML, 16, { align: 'right' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 210, 255);
  doc.text(`Ref: ${item.id}`, W - ML, 23, { align: 'right' });
  doc.setFillColor(...(isActive ? GREEN : GRAY));
  doc.roundedRect(W - ML - 30, 28, 30, 7, 2, 2, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
  doc.text(item.status.toUpperCase(), W - ML - 15, 33, { align: 'center' });

  let y = 46;
  doc.setFillColor(...LGRAY);
  doc.roundedRect(ML, y, W - ML * 2, 28, 3, 3, 'F');
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
  doc.text('PRESCRIBING PHYSICIAN', ML + 4, y + 7);
  doc.text(item.doc || 'Doctor', ML + 4, y + 14);
  doc.text(item.spec || '', ML + 4, y + 21);
  const mid = W / 2 + 4;
  doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...GRAY);
  doc.text('PATIENT', mid, y + 7);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DKBLUE);
  doc.text(item.patientName || 'Patient', mid, y + 14);
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
  doc.text(`ID: ${item.patientID || 'Unknown'}  •  ${item.date || ''}  •  ${item.time || ''}`, mid, y + 21);
  y += 36;

  if (item.medications && item.medications.length > 0) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DKBLUE);
    doc.text('Prescribed Medications', ML, y);
    y += 3;
    doc.setFillColor(168, 85, 247);
    doc.rect(ML, y, 2, item.medications.length * 18 + 4, 'F');
    y += 5;
    item.medications.forEach((med, i) => {
      if (y > H - 40) { doc.addPage(); y = 16; }
      doc.setFillColor(250, 245, 255);
      doc.roundedRect(ML + 4, y, W - ML * 2 - 4, 16, 2, 2, 'F');
      doc.setFillColor(168, 85, 247);
      doc.roundedRect(ML + 7, y + 4, 7, 7, 1, 1, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
      doc.text(String(i + 1), ML + 10.5, y + 9, { align: 'center' });
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DKBLUE);
      doc.text(med.name || 'Medication', ML + 17, y + 7);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
      doc.text(`Dose: ${med.dose || ''}  •  Freq: ${med.freq || ''}  •  Duration: ${med.dur || ''}`, ML + 17, y + 13);
      y += 18;
    });
    if (item.instructions) {
      if (y > H - 30) { doc.addPage(); y = 16; }
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(ML, y, W - ML * 2, 13, 2, 2, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(180, 83, 9);
      doc.text('Note:', ML + 4, y + 5.5);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 100, 20);
      doc.text(item.instructions || '', ML + 22, y + 5.5, { maxWidth: W - ML * 2 - 26 });
      y += 15;
    }
    y += 4;
  }

  if (item.labs && item.labs.length > 0) {
    if (y > H - 40) { doc.addPage(); y = 16; }
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DKBLUE);
    doc.text('Lab & Radiology Requests', ML, y);
    y += 3;
    doc.setFillColor(...GREEN);
    doc.rect(ML, y, 2, item.labs.length * 14 + 4, 'F');
    y += 5;
    item.labs.forEach((lab, i) => {
      if (y > H - 40) { doc.addPage(); y = 16; }
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(ML + 4, y, W - ML * 2 - 4, 12, 2, 2, 'F');
      doc.setFillColor(...GREEN);
      doc.roundedRect(ML + 7, y + 2.5, 7, 7, 1, 1, 'F');
      doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
      doc.text(String(i + 1), ML + 10.5, y + 7.5, { align: 'center' });
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DKBLUE);
      doc.text(lab.name || 'Lab Request', ML + 17, y + 6.5);
      if (lab.note) {
        doc.setFontSize(7.5); doc.setFont('helvetica', 'italic'); doc.setTextColor(...GRAY);
        doc.text(`Note: ${lab.note}`, ML + 17, y + 11);
      }
      y += 14;
    });
    if (item.labInstructions) {
      if (y > H - 30) { doc.addPage(); y = 16; }
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(ML, y, W - ML * 2, 12, 2, 2, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(37, 99, 235);
      doc.text('Lab Note:', ML + 4, y + 5);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(59, 130, 246);
      doc.text(item.labInstructions || '', ML + 26, y + 5, { maxWidth: W - ML * 2 - 30 });
      y += 14;
    }
    y += 4;
  }

  if (item.clinicalNotes) {
    if (y > H - 50) { doc.addPage(); y = 16; }
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DKBLUE);
    doc.text('Clinical Notes', ML, y);
    y += 4;
    const noteLines = doc.splitTextToSize(item.clinicalNotes || '', W - ML * 2 - 8);
    const noteH = noteLines.length * 5 + 8;
    doc.setFillColor(...LGRAY);
    doc.roundedRect(ML, y, W - ML * 2, noteH, 2, 2, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY);
    doc.text(noteLines, ML + 4, y + 6);
    y += noteH + 4;
  }

  doc.setFillColor(...BLUE);
  doc.rect(0, H - 18, W, 18, 'F');
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
  doc.text('PulseX — Your Trusted Health Platform', W / 2, H - 10, { align: 'center' });
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 210, 255);
  doc.text('Auto-generated document • Valid only with authorized physician signature', W / 2, H - 4, { align: 'center' });

  doc.save(`prescription-${item.id}.pdf`);
}

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
};

const toDateTime = (rawDate, rawFormattedDate, rawFormattedTime) => {
  const parsed = rawDate ? new Date(rawDate) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return {
      date: parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return {
    date: rawFormattedDate || '',
    time: rawFormattedTime || '',
  };
};

const mapMedication = (med) => ({
  name: firstNonEmpty(med?.name, med?.drugName, med?.DrugName, med?.drug_name, ''),
  dose: firstNonEmpty(med?.dose, med?.dosage, med?.Dosage, ''),
  freq: firstNonEmpty(med?.freq, med?.frequency, med?.Frequency, med?.displayFrequency, med?.DisplayFrequency, ''),
  dur: firstNonEmpty(med?.dur, med?.duration, med?.Duration, ''),
});

const mapLab = (lab, index) => ({
  id: String(firstNonEmpty(lab?.id, lab?.Id, `lab-${index + 1}`)),
  name: firstNonEmpty(lab?.name, lab?.testName, lab?.TestName, lab?.test_name, ''),
  note: firstNonEmpty(
    lab?.note,
    lab?.additionalNotes,
    lab?.AdditionalNotes,
    lab?.additional_notes,
    lab?.instructions,
    lab?.Instructions,
    ''
  ),
});

const mapRxFromApi = (rx) => {
  const createdAt = firstNonEmpty(rx?.createdAt, rx?.CreatedAt, rx?.issuedAt, rx?.IssuedAt);
  const formattedDate = firstNonEmpty(rx?.formattedDate, rx?.FormattedDate, rx?.date, rx?.Date, '');
  const formattedTime = firstNonEmpty(rx?.formattedTime, rx?.FormattedTime, rx?.time, rx?.Time, '');
  const { date, time } = toDateTime(createdAt, formattedDate, formattedTime);

  const medsRaw = firstNonEmpty(rx?.medications, rx?.Medications, []);
  const labsRaw = firstNonEmpty(rx?.labRequests, rx?.LabRequests, rx?.labs, rx?.Labs, []);
  const user = getStoredUser() || {};
  const patientAvatar = resolveFileUrl(firstNonEmpty(user.profilePicture, user.ProfilePicture, ''));

  return {
    id: String(firstNonEmpty(rx?.id, rx?.Id, '')),
    refId: String(firstNonEmpty(rx?.prescriptionId, rx?.PrescriptionId, rx?.id, rx?.Id, '')),
    doc: firstNonEmpty(rx?.doctorName, rx?.DoctorName, rx?.doc, 'Doctor'),
    spec: firstNonEmpty(rx?.doctorSpecialization, rx?.DoctorSpecialization, rx?.spec, ''),
    doctorAvatar: resolveFileUrl(firstNonEmpty(rx?.doctorProfilePicture, rx?.DoctorProfilePicture, '')),
    date,
    time,
    status: firstNonEmpty(rx?.status, rx?.Status, 'Active'),
    patientName: firstNonEmpty(rx?.patientName, rx?.PatientName, user.fullName, user.FullName, ''),
    patientID: String(firstNonEmpty(rx?.patientIdNumber, rx?.PatientIdNumber, rx?.patientId, rx?.PatientId, '')),
    patientAvatar,
    medications: Array.isArray(medsRaw) ? medsRaw.map(mapMedication) : [],
    instructions: firstNonEmpty(rx?.importantInstructions, rx?.ImportantInstructions, rx?.instructions, ''),
    labs: Array.isArray(labsRaw) ? labsRaw.map(mapLab) : [],
    labInstructions: firstNonEmpty(rx?.labInstructions, rx?.LabInstructions, ''),
    clinicalNotes: firstNonEmpty(rx?.clinicalNotes, rx?.ClinicalNotes, ''),
  };
};

const PatientPrescriptions = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    document.title = 'Prescriptions | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'View and download your medical prescriptions and reports.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const { getMyPrescriptions, getMyPrescriptionStats } = await import(
          '../../../../services/prescriptionService'
        );
        const [list, s] = await Promise.all([
          getMyPrescriptions({}).catch(() => null),
          getMyPrescriptionStats().catch(() => null),
        ]);
        if (ignore) return;
        const items = Array.isArray(list) ? list : (list?.items || list?.prescriptions || []);
        setPrescriptions(items.map(mapRxFromApi));
        setStats({
          total: s?.total ?? s?.Total ?? s?.totalPrescriptions ?? s?.TotalPrescriptions ?? items.length,
          active: s?.active ?? s?.Active ?? s?.activePrescriptions ?? s?.ActivePrescriptions ?? items.filter((i) => i.status === 'Active').length,
          completed: s?.completed ?? s?.Completed ?? s?.completedPrescriptions ?? s?.CompletedPrescriptions ?? items.filter((i) => i.status === 'Completed').length,
        });
      } catch (err) {
        console.error('Load prescriptions failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const source = prescriptions.length > 0 ? prescriptions : [];
  const filtered = source.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.doc.toLowerCase().includes(q) || p.date.toLowerCase().includes(q);
    const matchFilter =
      filter === 'All' ||
      (filter === 'Active Only' && p.status === 'Active') ||
      (filter === 'Completed Only' && p.status === 'Completed');
    return matchSearch && matchFilter;
  });

  const total = stats.total;
  const active = stats.active;
  const completed = stats.completed;

  return (
    <main
      className="min-h-screen p-[24px] bg-[#FAFBFF] dark:bg-[#0B1120] rounded-[22px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <PrescriptionsHeader />

      <StatsRow total={total} active={active} completed={completed} visible={visible} />

      <SearchFilterBar
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        filter={filter}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((o) => !o)}
        onSelectFilter={setFilter}
      />

      <aside className="text-[13px] text-gray-500 dark:text-gray-400 font-medium mb-4">
        Showing <span className="font-bold text-black-main-text dark:text-[#E2E8F0]">{filtered.length}</span> prescription{filtered.length !== 1 ? 's' : ''}
      </aside>

      <PrescriptionsGrid
        items={filtered}
        visible={visible}
        onView={(item) => navigate(`/patient/prescription/${item.id}`, { state: { prescription: item } })}
        onDownload={generatePrescriptionPDF}
      />

      <footer className="sr-only">
        <p>End of prescriptions page.</p>
      </footer>
    </main>
  );
};

export default PatientPrescriptions;
