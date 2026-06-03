import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCodeCard from '../../components/QRCode/QRCodeCard';
import QRCodeDetails from '../../components/QRCode/QRCodeDetails';
import QRCodeHeader from '../../components/QRCode/QRCodeHeader';
import Toast from '../../../../components/Toast/Toast';
import { resolveFileUrl } from '../../../../utils/api';
import {
  generateQRCode,
  getMyRecords,
} from '../../../../services/medicalRecordService';
import { useAuth } from '../../../../context/AuthContext';

const TYPE_ORDER = { ECG: 0, 'X-Ray': 1, 'Medical File': 2 };

const TYPE_RGB = {
  ECG: [51, 60, 245],
  'X-Ray': [124, 58, 237],
  'Medical File': [217, 119, 6],
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Failed to read image blob'));
  reader.readAsDataURL(blob);
});

const buildFileCandidateUrls = (filePath) => {
  if (!filePath) return [];
  const cleaned = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const urls = [resolveFileUrl(cleaned)];

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol || 'http:';
    urls.push(`${protocol}//${window.location.hostname}:5245${cleaned}`);
    urls.push(`${protocol}//localhost:5245${cleaned}`);
    urls.push(`${protocol}//127.0.0.1:5245${cleaned}`);
  }

  return Array.from(new Set(urls));
};

const fetchImageDataUrl = async (filePath) => {
  let lastError = new Error('Image fetch failed');
  const urls = buildFileCandidateUrls(filePath);

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        lastError = new Error(`Image fetch failed: ${response.status}`);
        continue;
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        lastError = new Error('Fetched file is not an image');
        continue;
      }
      return blobToDataUrl(blob);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
};

const getImageFormat = (dataUrl = '') => {
  const lower = dataUrl.toLowerCase();
  if (lower.startsWith('data:image/png')) return 'PNG';
  if (lower.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
};

const addFittedImage = (doc, dataUrl, x, y, maxW, maxH) => {
  const props = doc.getImageProperties(dataUrl);
  const ratio = Math.min(maxW / props.width, maxH / props.height);
  const drawW = props.width * ratio;
  const drawH = props.height * ratio;
  const drawX = x + ((maxW - drawW) / 2);
  doc.addImage(dataUrl, getImageFormat(dataUrl), drawX, y, drawW, drawH);
  return drawH;
};

const PatientQRCode = () => {
  const qrRef = useRef(null);
  const { user } = useAuth();
  const [toast, setToast] = useState({ visible: false, title: '', msg: '', type: 'success' });
  const showToast = (title, msg, type = 'success') => {
    setToast({ visible: true, title, msg, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const [records, setRecords] = useState([]);

  useEffect(() => {
    document.title = 'QR Code | PulseX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Access your medical records quickly using your personal QR code.');
  }, []);

  const [userData, setUserData] = useState({
    name: '',
    generatedDate: new Date().toLocaleDateString('en-GB'),
    totalFiles: 0,
    medicalImages: [],
    qrCodeValue: '',
  });

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [qrResp, resp] = await Promise.all([
          generateQRCode().catch(() => null),
          getMyRecords().catch(() => null),
        ]);
        if (ignore) return;
        const files = Array.isArray(resp) ? resp : (resp?.records || resp?.items || []);
        setRecords(files);
        const patientId = qrResp?.patientId;
        const publicUrl = patientId
          ? `${window.location.origin}/public-records/${patientId}`
          : `${window.location.origin}/patient/records`;
        setUserData({
          name: user?.fullName || '',
          generatedDate: new Date().toLocaleDateString('en-GB'),
          totalFiles: files.length,
          medicalImages: [],
          qrCodeValue: publicUrl,
        });
      } catch (err) {
        console.error('Load QR failed', err);
      }
    };
    load();
    return () => { ignore = true; };
  }, [user]);

  const downloadFullPdf = async () => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;

      // ── Header bar ──────────────────────────────────────────────
      doc.setFillColor(51, 60, 245);
      doc.rect(0, 0, pageW, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PulseX — Medical Records Report', pageW / 2, 12, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Confidential medical document', pageW / 2, 20, { align: 'center' });

      // ── Patient info block ───────────────────────────────────────
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      let y = 38;
      doc.text(`Patient: ${userData.name || 'N/A'}`, margin, y);
      doc.text(`Generated: ${userData.generatedDate}`, pageW - margin, y, { align: 'right' });
      y += 6;
      doc.text(`Total Files: ${records.length}`, margin, y);
      doc.text(`ECG: ${records.filter(r => r.recordType === 'ECG').length}   X-Ray: ${records.filter(r => r.recordType === 'X-Ray').length}   Medical File: ${records.filter(r => r.recordType === 'Medical File').length}`, pageW - margin, y, { align: 'right' });

      // ── QR Code ──────────────────────────────────────────────────
      const svgEl = qrRef.current?.querySelector('svg');
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const canvas = document.createElement('canvas');
        canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        await new Promise((resolve) => { img.onload = () => { ctx.drawImage(img, 0, 0, 300, 300); URL.revokeObjectURL(blobUrl); resolve(); }; img.src = blobUrl; });
        const qrX = (pageW - 55) / 2;
        y += 8;
        doc.addImage(canvas.toDataURL('image/png'), 'PNG', qrX, y, 55, 55);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Scan to view records on any device', pageW / 2, y + 60, { align: 'center' });
        y += 68;
      } else {
        y += 10;
      }

      // ── Divider ───────────────────────────────────────────────────
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      if (records.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text('No medical records found.', pageW / 2, y + 20, { align: 'center' });
      } else {
        // ── Records table ─────────────────────────────────────────
        const sorted = [...records].sort((a, b) => {
          const td = (TYPE_ORDER[a.recordType] ?? 99) - (TYPE_ORDER[b.recordType] ?? 99);
          if (td !== 0) return td;
          return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
        });

        // Table header
        const colX = [margin, margin + 32, margin + 100, margin + 135];
        const headers = ['Type', 'File Name', 'Date', 'Size'];
        doc.setFillColor(241, 243, 255);
        doc.rect(margin - 2, y - 4, pageW - (margin * 2) + 4, 8, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 60, 245);
        headers.forEach((h, i) => doc.text(h, colX[i], y));
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        sorted.forEach((rec, idx) => {
          if (y > pageH - 20) { doc.addPage(); y = 20; }

          // Alternating row background
          if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 255);
            doc.rect(margin - 2, y - 4, pageW - (margin * 2) + 4, 7, 'F');
          }

          const rgb = TYPE_RGB[rec.recordType] || [100, 100, 100];
          // Type badge
          doc.setFillColor(...rgb);
          doc.roundedRect(colX[0] - 1, y - 3.5, 28, 5.5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text(rec.recordType || '—', colX[0] + 14, y, { align: 'center' });

          doc.setTextColor(30, 30, 30);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');

          // File name (truncate if too long)
          const fname = (rec.fileName || '—').length > 30
            ? (rec.fileName || '—').slice(0, 28) + '…'
            : (rec.fileName || '—');
          doc.text(fname, colX[1], y);
          doc.text(fmtDate(rec.uploadedAt), colX[2], y);
          doc.text(fmtSize(rec.fileSize), colX[3], y);

          y += 8;
        });

        // Each uploaded record gets its own page for clear visual review.
        for (let i = 0; i < sorted.length; i += 1) {
          const rec = sorted[i];
          doc.addPage();

          let py = 20;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(20, 20, 20);
          doc.text(`Record ${i + 1} of ${sorted.length}`, margin, py);
          py += 8;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(40, 40, 40);
          const titleLines = doc.splitTextToSize(
            `${rec.recordType || 'Record'} — ${rec.fileName || 'Unnamed file'}`,
            pageW - (margin * 2)
          );
          doc.text(titleLines, margin, py);
          py += titleLines.length * 5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(110, 110, 110);
          doc.text(`Date: ${fmtDate(rec.uploadedAt)}`, margin, py);
          doc.text(`Size: ${fmtSize(rec.fileSize)}`, margin + 58, py);
          doc.text(`MIME: ${rec.fileType || '—'}`, margin + 102, py);
          py += 8;

          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.25);
          doc.line(margin, py, pageW - margin, py);
          py += 6;

          if (rec.fileType?.startsWith('image/') && rec.filePath) {
            try {
              const dataUrl = await fetchImageDataUrl(rec.filePath);
              const maxH = pageH - py - 22;
              addFittedImage(doc, dataUrl, margin, py, pageW - (margin * 2), maxH);
            } catch {
              doc.setTextColor(220, 38, 38);
              doc.setFontSize(11);
              doc.text('Could not load image preview for this record.', margin, py + 8);
            }
          } else if (rec.filePath) {
            const fileUrl = resolveFileUrl(rec.filePath);
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(10);
            doc.text('This record is not an image. Open the original file:', margin, py + 8);
            const linkText = fileUrl.length > 100 ? `${fileUrl.slice(0, 97)}...` : fileUrl;
            doc.setTextColor(37, 99, 235);
            doc.textWithLink(linkText, margin, py + 16, { url: fileUrl });
          } else {
            doc.setTextColor(220, 38, 38);
            doc.setFontSize(11);
            doc.text('No file path available for this record.', margin, py + 8);
          }
        }
      }

      // ── Footer ────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7.5);
        doc.setTextColor(160, 160, 160);
        doc.text(
          `Page ${p} of ${totalPages} — PulseX Confidential`,
          pageW / 2,
          pageH - 8,
          { align: 'center' }
        );
      }

      doc.save(`PulseX_MedicalRecords_${(userData.name || 'patient').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('Download Failed', 'Could not generate PDF. Please try again.', 'error');
    }
  };

  return (
    <main className="flex flex-col gap-6 p-[24px] bg-white dark:bg-[#111827] rounded-[22px]">
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
      <QRCodeHeader />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-20 px-0 sm:px-6 lg:px-10 justify-items-center" aria-label="QR code overview">
        <QRCodeCard qrRef={qrRef} userData={userData} onDownload={downloadFullPdf} />
        <aside>
          <QRCodeDetails items={['Blood Test Results', 'Radiology Scans', 'Medication Reports']} />
        </aside>
      </section>

      <footer className="sr-only">
        <p>End of QR code page.</p>
      </footer>
    </main>
  );
};

export default PatientQRCode;
