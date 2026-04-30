import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPatientRecords } from '../../services/medicalRecordService';
import { resolveFileUrl } from '../../utils/api';

const TYPE_COLOR = {
  ECG: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'X-Ray': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Medical File': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const TYPE_ORDER = {
  ECG: 0,
  'X-Ray': 1,
  'Medical File': 2,
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageRecord = (rec) => rec?.fileType?.startsWith('image/');

export default function PublicRecordsView() {
  const { patientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublicPatientRecords(patientId)
      .then((resp) => {
        setData(resp);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load records. Please try again later.');
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const records = data?.records || [];
  const sortedRecords = [...records].sort((a, b) => {
    const typeDiff = (TYPE_ORDER[a.recordType] ?? 99) - (TYPE_ORDER[b.recordType] ?? 99);
    if (typeDiff !== 0) return typeDiff;
    const aTime = new Date(a.uploadedAt || 0).getTime();
    const bTime = new Date(b.uploadedAt || 0).getTime();
    return bTime - aTime;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0.3" />
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="white" strokeWidth="1.5" />
              <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">PulseX</span>
          </div>
          <h1 className="text-xl font-semibold mt-4">Medical Records</h1>
          <p className="text-blue-100 text-sm mt-1">Scanned via QR Code</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Total Files', value: data?.totalRecords ?? 0 },
            { label: 'ECG', value: data?.ecgRecords ?? 0 },
            { label: 'X-Ray', value: data?.xRayRecords ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="py-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Records list */}
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
        {sortedRecords.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-semibold text-base">No records found</p>
            <p className="text-sm mt-1">This patient has no uploaded medical records.</p>
          </div>
        ) : (
          sortedRecords.map((rec) => {
            const colors = TYPE_COLOR[rec.recordType] || TYPE_COLOR['Medical File'];
            const fileUrl = rec.filePath ? resolveFileUrl(rec.filePath) : '';
            return (
              <div key={rec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
                <div className={`w-2 h-12 rounded-full ${colors.dot} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {rec.recordType}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 truncate">{rec.fileName}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatDate(rec.uploadedAt)}</span>
                    <span>·</span>
                    <span>{formatSize(rec.fileSize)}</span>
                    {rec.fileType && <><span>·</span><span>{rec.fileType}</span></>}
                  </div>
                  {rec.notes && <p className="text-xs text-gray-500 mt-1 italic">{rec.notes}</p>}

                  {fileUrl && isImageRecord(rec) && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block mt-3"
                    >
                      <img
                        src={fileUrl}
                        alt={rec.fileName || 'Medical record preview'}
                        className="w-full max-w-[420px] max-h-[220px] object-contain rounded-xl border border-gray-100 bg-gray-50"
                        loading="lazy"
                      />
                    </a>
                  )}

                  {fileUrl && !isImageRecord(rec) && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Open file
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="text-center text-xs text-gray-400 pb-8">
        Powered by PulseX — Secure Medical Records
      </footer>
    </div>
  );
}
