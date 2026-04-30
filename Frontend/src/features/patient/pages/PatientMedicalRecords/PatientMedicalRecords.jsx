import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  getMyRecords,
  uploadMedicalRecord,
  deleteRecord,
} from '../../../../services/medicalRecordService';
import { LuClipboardList, LuTrash2 } from 'react-icons/lu';
import UploadZones from '../../components/PatientMedicalRecords/UploadZones';
import DocumentsTableDesktop from '../../components/PatientMedicalRecords/DocumentsTableDesktop';
import DocumentsCardsMobile from '../../components/PatientMedicalRecords/DocumentsCardsMobile';
import ConfirmDeleteModal from '../../components/PatientMedicalRecords/ConfirmDeleteModal';
import Toast from '../../../../components/Toast/Toast';
import StatisticsCard from '../../components/PatientMedicalRecords/StatisticsCard';
import QrCtaSection from '../../components/PatientMedicalRecords/QrCtaSection';
import Qrcodepatiant from '../../../../assets/Images/Qrcodepatiant.svg';
import { BRAND } from '../../components/PatientMedicalRecords/constants.jsx';

let nextId = 10;

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExt = (filename) => filename.split('.').pop().toUpperCase();

const todayStr = () => new Date().toLocaleDateString('en-GB');

const mapRecord = (r) => ({
  id: r.id,
  name: (r.fileName || r.name || 'record').replace(/\.[^.]+$/, ''),
  type: (r.fileType || getExt(r.fileName || r.name || '') || 'FILE').toUpperCase(),
  size: r.fileSize ? formatFileSize(r.fileSize) : '—',
  date: r.uploadedAt
    ? new Date(r.uploadedAt).toLocaleDateString('en-GB')
    : (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : ''),
  category: r.recordType === 'X-Ray' ? 'Radiology' : (r.recordType || 'Medical File'),
  filePath: r.filePath || r.fileUrl || '',
});

const PatientMedicalRecords = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const resp = await getMyRecords();
      const items = Array.isArray(resp) ? resp : (resp?.records || resp?.items || []);
      setDocuments(items.map(mapRecord));
    } catch (err) {
      console.error('Load records failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const [selected, setSelected] = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const fileInputRefs = useRef({});

  const [confirmModal, setConfirmModal] = useState({ open: false, ids: [], label: '' });
  const [successToast, setSuccessToast] = useState({ open: false, message: '' });

  const showSuccess = (message) => {
    setSuccessToast({ open: true, message });
  };

  const openConfirm = (ids, label) => setConfirmModal({ open: true, ids, label });
  const closeConfirm = () => setConfirmModal({ open: false, ids: [], label: '' });

  const confirmDelete = async () => {
    const count = confirmModal.ids.length;
    try {
      await Promise.all(confirmModal.ids.map((id) => deleteRecord(id)));
      setDocuments((prev) => prev.filter((d) => !confirmModal.ids.includes(d.id)));
      setSelected((prev) => prev.filter((s) => !confirmModal.ids.includes(s)));
      showSuccess(count === 1 ? 'File deleted successfully.' : `${count} files deleted successfully.`);
    } catch (err) {
      showSuccess(err?.response?.data?.message || 'Delete failed');
    } finally {
      closeConfirm();
    }
  };

  const addFiles = useCallback(async (files, category) => {
    const recordType = category === 'Radiology' ? 'X-Ray' : category;
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadMedicalRecord(recordType, file))
      );
      await loadRecords();
      showSuccess(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded successfully.`);
    } catch (err) {
      showSuccess(err?.response?.data?.message || 'Upload failed');
    }
  }, []);

  const handleFileInput = (e, category) => {
    if (e.target.files?.length) addFiles(e.target.files, category);
    e.target.value = '';
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    setDragOver(null);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files, category);
  };

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected(selected.length === documents.length ? [] : documents.map((d) => d.id));

  const stats = {
    total: documents.length,
    ecg: documents.filter((d) => d.category === 'ECG').length,
    xray: documents.filter((d) => d.category === 'Radiology').length,
    medical: documents.filter((d) => d.category === 'Medical File').length,
    lastDate: documents.length
      ? [...documents].sort((a, b) => {
        const parse = (s) => {
          const [d, m, y] = s.split('/');
          return new Date(y, m - 1, d);
        };
        return parse(b.date) - parse(a.date);
      })[0].date
      : '—',
  };

  return (
    <main
      className="medical-records-root flex flex-col gap-6 p-4 sm:p-6 rounded-3xl min-h-screen bg-[#FFFFFFE5] dark:bg-[#0B1120]"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <Toast
        visible={successToast.open}
        title="Success"
        message={successToast.message}
        duration={3000}
        onClose={() => setSuccessToast({ open: false, message: '' })}
      />

      <ConfirmDeleteModal
        open={confirmModal.open}
        ids={confirmModal.ids}
        label={confirmModal.label}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
      />

      <header className="flex flex-col gap-1 pb-4 ">
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center text-[24px] shrink-0 text-black-main-text dark:text-[#E2E8F0]">
            <LuClipboardList />
          </div>
          <h1 className="text-[24px] font-semibold tracking-tight text-black-main-text dark:text-[#E2E8F0]">
            Medical Records
          </h1>
        </div>

        <p className="text-[18px] text-neutral-500 dark:text-gray-400 font-normal leading-tight ml-3 ">
          Upload and view your medical health easily.
        </p>
      </header>

      <section aria-labelledby="upload-zones-heading">
        <h2 id="upload-zones-heading" className="sr-only">Upload Zones</h2>
        <UploadZones
          dragOver={dragOver}
          setDragOver={setDragOver}
          fileInputRefs={fileInputRefs}
          onDrop={handleDrop}
          onFileInput={handleFileInput}
          brand={BRAND}
        />
      </section>

      <section className="overflow-visible p-0" aria-labelledby="document-list-heading">
        <article className="bg-transparent rounded-none overflow-visible py-0">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-2 sm:py-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16.5196 16.5009C16.6946 16.3649 16.8536 16.2059 17.1706 15.8889L21.1276 11.9309C21.2236 11.8359 21.1796 11.6709 21.0526 11.6259C20.4329 11.4111 19.8706 11.0574 19.4086 10.5919C18.9431 10.1299 18.5894 9.5676 18.3746 8.94792C18.3296 8.82092 18.1646 8.77692 18.0696 8.87292L14.1106 12.8299C13.7936 13.1469 13.6346 13.3059 13.4986 13.4809C13.3366 13.6882 13.1993 13.9103 13.0866 14.1469C12.9916 14.3469 12.9206 14.5609 12.7786 14.9869L12.5946 15.5369L12.3026 16.4119L12.0296 17.2319C11.9956 17.3347 11.9908 17.4449 12.0158 17.5503C12.0407 17.6556 12.0945 17.7519 12.171 17.8285C12.2476 17.905 12.3439 17.9588 12.4493 17.9838C12.5546 18.0088 12.6648 18.004 12.7676 17.9699L13.5876 17.6969L14.4626 17.4049L15.0126 17.2209C15.4386 17.0789 15.6526 17.0089 15.8526 16.9129C16.0893 16.7996 16.3123 16.6622 16.5196 16.5009ZM22.3676 10.6919C22.7733 10.2861 23.0011 9.73583 23.001 9.16206C23.0009 8.5883 22.7729 8.03807 22.3671 7.63242C21.9613 7.22677 21.411 6.99893 20.8373 6.99902C20.2635 6.99912 19.7133 7.22714 19.3076 7.63292L19.1816 7.76092C19.1208 7.8204 19.0755 7.89391 19.0497 7.97498C19.0239 8.05605 19.0184 8.14222 19.0336 8.22592C19.0536 8.33292 19.0886 8.49092 19.1536 8.67792C19.2836 9.05292 19.5296 9.54492 19.9926 10.0079C20.4556 10.4709 20.9476 10.7169 21.3226 10.8469C21.5106 10.9119 21.6676 10.9469 21.7746 10.9669C21.8583 10.9813 21.9442 10.9754 22.0252 10.9496C22.1061 10.9239 22.1796 10.879 22.2396 10.8189L22.3676 10.6919Z" fill="#333CF5" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.172 3.172C3 4.343 3 6.229 3 10V14C3 17.771 3 19.657 4.172 20.828C5.344 21.999 7.229 22 11 22H13C16.771 22 18.657 22 19.828 20.828C20.981 19.676 21 17.832 21 14.18L18.182 16.998C17.912 17.268 17.691 17.489 17.442 17.684C17.1499 17.9128 16.8333 18.1083 16.498 18.267C16.1911 18.4051 15.8758 18.5236 15.554 18.622L13.242 19.393C12.875 19.5154 12.4811 19.5332 12.1046 19.4443C11.728 19.3554 11.3837 19.1635 11.1101 18.8899C10.8365 18.6163 10.6446 18.272 10.5557 17.8954C10.4668 17.5189 10.4846 17.125 10.607 16.758L10.881 15.938L11.356 14.512L11.377 14.446C11.498 14.084 11.597 13.788 11.733 13.502C11.893 13.166 12.0873 12.8517 12.316 12.559C12.511 12.309 12.732 12.089 13.002 11.819L17.008 7.812L18.12 6.7L18.247 6.573C18.5868 6.23215 18.9907 5.96188 19.4353 5.77773C19.88 5.59358 20.3567 5.49919 20.838 5.5C20.687 4.47 20.394 3.737 19.828 3.172C18.657 2 16.771 2 13 2H11C7.229 2 5.343 2 4.172 3.172ZM7.25 9C7.25 8.80109 7.32902 8.61032 7.46967 8.46967C7.61032 8.32902 7.80109 8.25 8 8.25H14.5C14.6989 8.25 14.8897 8.32902 15.0303 8.46967C15.171 8.61032 15.25 8.80109 15.25 9C15.25 9.19891 15.171 9.38968 15.0303 9.53033C14.8897 9.67098 14.6989 9.75 14.5 9.75H8C7.80109 9.75 7.61032 9.67098 7.46967 9.53033C7.32902 9.38968 7.25 9.19891 7.25 9ZM7.25 13C7.25 12.8011 7.32902 12.6103 7.46967 12.4697C7.61032 12.329 7.80109 12.25 8 12.25H10.5C10.6989 12.25 10.8897 12.329 11.0303 12.4697C11.171 12.6103 11.25 12.8011 11.25 13C11.25 13.1989 11.171 13.3897 11.0303 13.5303C10.8897 13.671 10.6989 13.75 10.5 13.75H8C7.80109 13.75 7.61032 13.671 7.46967 13.5303C7.32902 13.3897 7.25 13.1989 7.25 13ZM7.25 17C7.25 16.8011 7.32902 16.6103 7.46967 16.4697C7.61032 16.329 7.80109 16.25 8 16.25H9.5C9.69891 16.25 9.88968 16.329 10.0303 16.4697C10.171 16.6103 10.25 16.8011 10.25 17C10.25 17.1989 10.171 17.3897 10.0303 17.5303C9.88968 17.671 9.69891 17.75 9.5 17.75H8C7.80109 17.75 7.61032 17.671 7.46967 17.5303C7.32902 17.3897 7.25 17.1989 7.25 17Z" fill="#333CF5" />
                </svg>
                <h2 id="document-list-heading" className="text-[20px] font-normal text-black-main-text dark:text-[#E2E8F0]">
                  Document List
                </h2>
              </div>
              <p className="text-[14px] text-neutral-500 dark:text-gray-400 font-normal leading-tight">
                Manage and operate your document files.
              </p>
            </div>

            {selected.length > 0 && (
              <button
                className="w-full md:w-auto flex items-center justify-center gap-1.5 text-white rounded-xl px-4 py-2 text-[14px] font-bold transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: '#E7000B' }}
                onClick={() => openConfirm(selected, '')}
              >
                <LuTrash2 className="w-4 h-4 " /> Delete Selected ({selected.length})
              </button>
            )}
          </header>

          <DocumentsCardsMobile
            documents={documents}
            selected={selected}
            toggleSelect={toggleSelect}
            openConfirm={openConfirm}
            brand={BRAND}
          />

          <DocumentsTableDesktop
            documents={documents}
            selected={selected}
            toggleSelect={toggleSelect}
            toggleAll={toggleAll}
            openConfirm={openConfirm}
            brand={BRAND}
          />
        </article>
      </section>

      <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between w-full gap-6 lg:gap-8 mt-8 lg:mt-10" aria-label="Medical Insights">
        <article className="w-full lg:flex-1">
          <QrCtaSection qrImage={Qrcodepatiant} />
        </article>
        <aside aria-label="Statistics Summary">
          <StatisticsCard stats={stats} />
        </aside>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .medical-records-root button {
          cursor: pointer;
        }
        .table-scrollbar {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        .table-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .table-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .table-scrollbar::-webkit-scrollbar-thumb {
          background: #333cf540;
          border-radius: 999px;
        }
        .table-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333CF5;
        }
        @media (max-width: 640px) {
          .table-scrollbar::-webkit-scrollbar {
            height: 4px;
          }
        }
      `,
        }}
      />

      <footer className="sr-only">Medical records page footer</footer>
    </main>
  );
};

export default PatientMedicalRecords;
