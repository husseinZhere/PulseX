import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import QRCodeCard from '../../../patient/components/QRCode/QRCodeCard';
import QRCodeDetails from '../../../patient/components/QRCode/QRCodeDetails';
import { resolveFileUrl } from '../../../../utils/api';
import { viewPatientRecords } from '../../../../services/medicalRecordService';

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
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return [filePath];
  }
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

const PatientQrSection = ({ patient }) => {
  const qrRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullRecords, setFullRecords] = useState([]);

  useEffect(() => {
    let ignore = false;
    if (patient?.id) {
      viewPatientRecords(patient.id)
        .then(res => {
          if (!ignore) setFullRecords(res?.records || res?.items || []);
        })
        .catch(err => console.error('Failed to fetch full records for PDF', err));
    }
    return () => { ignore = true; };
  }, [patient?.id]);

  const safeQrValue = patient?.id 
    ? (typeof window !== 'undefined' ? `${window.location.origin}/public-records/${patient.id}` : `https://pulsex.local/public-records/${patient.id}`)
    : (typeof window !== 'undefined' ? `${window.location.origin}/patient/qr` : 'https://pulsex.local/patient/qr');
  const generatedAt = patient?.qrCodeGeneratedAt
    ? new Date(patient.qrCodeGeneratedAt).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  const userData = {
    name: patient?.name || 'Unknown Patient',
    generatedDate: generatedAt,
    totalFiles: fullRecords.length > 0 ? fullRecords.length : (patient?.totalFilesCount || 0),
    qrCodeValue: safeQrValue,
  };

  const records = fullRecords;

  const handleDownloadFullPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 18;

      doc.setFillColor(51, 60, 245);
      doc.rect(0, 0, pageW, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PulseX — Medical Records Report', pageW / 2, 12, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Confidential medical document', pageW / 2, 20, { align: 'center' });

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(10);
      let y = 38;
      doc.text(`Patient: ${userData.name}`, margin, y);
      doc.text(`Generated: ${userData.generatedDate}`, pageW - margin, y, { align: 'right' });
      y += 6;
      doc.text(`Total Files: ${records.length}`, margin, y);
      doc.text(
        `ECG: ${records.filter(r => r.recordType === 'ECG').length}   ` +
        `X-Ray: ${records.filter(r => r.recordType === 'X-Ray').length}   ` +
        `Medical File: ${records.filter(r => r.recordType === 'Medical File').length}`,
        pageW - margin, y, { align: 'right' }
      );

      const svgEl = qrRef.current?.querySelector('svg');
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const canvas = document.createElement('canvas');
        canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        await new Promise((resolve) => {
          img.onload = () => { ctx.drawImage(img, 0, 0, 300, 300); URL.revokeObjectURL(blobUrl); resolve(); };
          img.src = blobUrl;
        });
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

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      if (records.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.text('No medical records found.', pageW / 2, y + 20, { align: 'center' });
      } else {
        const sorted = [...records].sort((a, b) => {
          const td = (TYPE_ORDER[a.recordType] ?? 99) - (TYPE_ORDER[b.recordType] ?? 99);
          if (td !== 0) return td;
          return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
        });

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

          if (idx % 2 === 0) {
            doc.setFillColor(250, 250, 255);
            doc.rect(margin - 2, y - 4, pageW - (margin * 2) + 4, 7, 'F');
          }

          const rgb = TYPE_RGB[rec.recordType] || [100, 100, 100];
          doc.setFillColor(...rgb);
          doc.roundedRect(colX[0] - 1, y - 3.5, 28, 5.5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.text(rec.recordType || '—', colX[0] + 14, y, { align: 'center' });

          doc.setTextColor(30, 30, 30);
          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');

          const fname = (rec.fileName || '—').length > 30
            ? (rec.fileName || '—').slice(0, 28) + '…'
            : (rec.fileName || '—');
          doc.text(fname, colX[1], y);
          doc.text(fmtDate(rec.uploadedAt), colX[2], y);
          doc.text(fmtSize(rec.fileSize), colX[3], y);

          y += 8;
        });

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
            `${rec.type || 'Record'} — ${rec.fileName || 'Unnamed file'}`,
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

          if ((rec.filePath && rec.filePath.match(/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i)) || rec.fileType?.startsWith('image/')) {
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
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="mt-6 flex flex-col lg:flex-row gap-6 items-start" aria-label="QR section">
      <QRCodeCard
        qrRef={qrRef}
        userData={{
          ...userData,
          totalFiles: (userData.totalFiles || records.length)
        }}
        onDownload={handleDownloadFullPdf}
      />
      <QRCodeDetails items={['Blood Test Results', 'Radiology Scans', 'Medication Reports']} />
    </section>
  );
};

export default PatientQrSection;
