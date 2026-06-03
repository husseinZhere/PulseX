import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from '../DataTable/DataTable';
import ConfirmModal from '../../ConfirmModal/ConfirmModal';
import EmptyState from '../../shared/EmptyState/EmptyState';
import { Toast } from '../../../../../components';
import { FiSearch, FiUpload, FiPlus } from "react-icons/fi";
import exportDoctorsToExcel from './exportDoctorsToExcel';
import { getAllUsers, deleteDoctor } from '../../../../../services/adminService';
import { resolveFileUrl } from '../../../../../utils/api';

const formatJoinedDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
};

const calcAge = (dob) => {
  if (!dob) return '';
  try {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? String(age) : '';
  } catch {
    return '';
  }
};

const withDrPrefix = (name) => {
  if (!name) return '';
  const t = name.trim();
  return /^dr\.?\s/i.test(t) ? t : `DR. ${t}`;
};

const mapUserToDoctor = (u) => ({
  id: u.id,
  fullName: withDrPrefix(u.fullName || u.email || ''),
  email: u.email || '',
  age: calcAge(u.dateOfBirth),
  location: u.clinicLocation || '',
  price: u.consultationPrice ?? '',
  joinedDate: formatJoinedDate(u.createdAt),
  image: resolveFileUrl(u.profilePicture || ''),
  isActive: u.isActive,
});

export default function DoctorManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ open: false, type: 'single', targetId: null });
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      const list = (Array.isArray(users) ? users : [])
        .filter((u) => u.role === 'Doctor')
        .sort((a, b) => b.id - a.id)
        .map(mapUserToDoctor);
      setDoctors(list);
    } catch (err) {
      setToast({
        visible: true,
        title: 'Error',
        message: err?.response?.data?.message || 'Failed to load doctors',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (location.state?.success) {
      setToast({
        visible: true,
        title: location.state.title || 'Done Successfully',
        message: location.state.message || 'Your changes have been saved successfully',
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openSingleDeleteModal = (item) => {
    setModal({ open: true, type: 'single', targetId: item.id });
  };

  const openBulkDeleteModal = () => {
    setModal({ open: true, type: 'bulk', targetId: null });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (modal.type === 'single') {
        await deleteDoctor(modal.targetId);
        setDoctors((prev) => prev.filter((d) => d.id !== modal.targetId));
        setSelectedIds((prev) => prev.filter((id) => id !== modal.targetId));
        setToast({ visible: true, title: 'Deleted Successfully', message: 'Doctor has been removed.' });
      } else {
        await Promise.all(selectedIds.map((id) => deleteDoctor(id)));
        setDoctors((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
        setToast({ visible: true, title: 'Deleted Successfully', message: `${selectedIds.length} doctors removed.` });
        setSelectedIds([]);
      }
    } catch (err) {
      setToast({
        visible: true,
        title: 'Delete Failed',
        message: err?.response?.data?.message || err?.message || 'Delete failed',
      });
    } finally {
      setModal({ open: false, type: 'single', targetId: null });
    }
  };

  const handleExport = async () => {
    try {
      await exportDoctorsToExcel(doctors);
    } catch (e) { console.error("Export failed", e); }
  };

  // 3. الفلترة
  const filteredDoctors = doctors.filter((d) =>
    d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[60vh] text-gray-400 text-[18px]">
        Loading doctors…
      </section>
    );
  }

  if (doctors.length === 0) {
    return (
      <section className="flex items-center p-6 justify-center min-h-[80vh] bg-white dark:bg-[#111827]">

        <EmptyState
          pageIcon={<svg xmlns="http://www.w3.org/2000/svg" width="27" height="23" viewBox="0 0 27 23" fill="none" className="text-black-main-text dark:text-[#E2E8F0]">
            <path d="M2.66667 18.6667V17.8C2.66667 17.3467 2.88 16.92 3.21333 16.72C5.46667 15.3733 8.04 14.6667 10.6667 14.6667C10.7067 14.6667 10.7333 14.6667 10.7733 14.68C10.9067 13.7467 11.1733 12.8533 11.56 12.04C11.2667 12.0133 10.9733 12 10.6667 12C7.44 12 4.42667 12.8933 1.85333 14.4267C0.68 15.12 0 16.4267 0 17.8V21.3333H12.3467C11.7867 20.5333 11.3467 19.6267 11.0533 18.6667H2.66667ZM10.6667 10.6667C13.6133 10.6667 16 8.28 16 5.33333C16 2.38667 13.6133 0 10.6667 0C7.72 0 5.33333 2.38667 5.33333 5.33333C5.33333 8.28 7.72 10.6667 10.6667 10.6667ZM10.6667 2.66667C12.1333 2.66667 13.3333 3.86667 13.3333 5.33333C13.3333 6.8 12.1333 8 10.6667 8C9.2 8 8 6.8 8 5.33333C8 3.86667 9.2 2.66667 10.6667 2.66667ZM25 16C25 15.7067 24.96 15.44 24.92 15.16L26.44 13.8133L25.1067 11.5067L23.1733 12.16C22.7467 11.8 22.2667 11.52 21.7333 11.32L21.3333 9.33333H18.6667L18.2667 11.32C17.7333 11.52 17.2533 11.8 16.8267 12.16L14.8933 11.5067L13.56 13.8133L15.08 15.16C15.04 15.44 15 15.7067 15 16C15 16.2933 15.04 16.56 15.08 16.84L13.56 18.1867L14.8933 20.4933L16.8267 19.84C17.2533 20.2 17.7333 20.48 18.2667 20.68L18.6667 22.6667H21.3333L21.7333 20.68C22.2667 20.48 22.7467 20.2 23.1733 19.84L25.1067 20.4933L26.44 18.1867L24.92 16.84C24.96 16.56 25 16.2933 25 16ZM20 18.6667C18.5333 18.6667 17.3333 17.4667 17.3333 16C17.3333 14.5333 18.5333 13.3333 20 13.3333C21.4667 13.3333 22.6667 14.5333 22.6667 16C22.6667 17.4667 21.4667 18.6667 20 18.6667Z" fill="currentColor" />
          </svg>}
          pageTitle="Doctor Management"
          pageSubtitle="View, edit, and manage all registered doctors."
          imgSrc="/no-patient.svg"
          imgClassName="mx-auto w-auto max-h-[220px]"
          title="No Doctors Found"
          description="You haven't added any Doctors yet. Start building your Doctor database by adding your first Doctor Details."
          buttonLabel="Add Doctor"
          onAction={() => navigate('/admin/doctors/create')}
        />
      </section>
    );
  }

  // 5. التصميم العادي في حالة وجود بيانات
  return (
    <section className="flex flex-col gap-6 p-6" aria-label="Doctor Management">
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        type="success"
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="23" viewBox="0 0 27 23" fill="none" className="text-black-main-text dark:text-[#E2E8F0]">
              <path d="M2.66667 18.6667V17.8C2.66667 17.3467 2.88 16.92 3.21333 16.72C5.46667 15.3733 8.04 14.6667 10.6667 14.6667C10.7067 14.6667 10.7333 14.6667 10.7733 14.68C10.9067 13.7467 11.1733 12.8533 11.56 12.04C11.2667 12.0133 10.9733 12 10.6667 12C7.44 12 4.42667 12.8933 1.85333 14.4267C0.68 15.12 0 16.4267 0 17.8V21.3333H12.3467C11.7867 20.5333 11.3467 19.6267 11.0533 18.6667H2.66667ZM10.6667 10.6667C13.6133 10.6667 16 8.28 16 5.33333C16 2.38667 13.6133 0 10.6667 0C7.72 0 5.33333 2.38667 5.33333 5.33333C5.33333 8.28 7.72 10.6667 10.6667 10.6667ZM10.6667 2.66667C12.1333 2.66667 13.3333 3.86667 13.3333 5.33333C13.3333 6.8 12.1333 8 10.6667 8C9.2 8 8 6.8 8 5.33333C8 3.86667 9.2 2.66667 10.6667 2.66667ZM25 16C25 15.7067 24.96 15.44 24.92 15.16L26.44 13.8133L25.1067 11.5067L23.1733 12.16C22.7467 11.8 22.2667 11.52 21.7333 11.32L21.3333 9.33333H18.6667L18.2667 11.32C17.7333 11.52 17.2533 11.8 16.8267 12.16L14.8933 11.5067L13.56 13.8133L15.08 15.16C15.04 15.44 15 15.7067 15 16C15 16.2933 15.04 16.56 15.08 16.84L13.56 18.1867L14.8933 20.4933L16.8267 19.84C17.2533 20.2 17.7333 20.48 18.2667 20.68L18.6667 22.6667H21.3333L21.7333 20.68C22.2667 20.48 22.7467 20.2 23.1733 19.84L25.1067 20.4933L26.44 18.1867L24.92 16.84C24.96 16.56 25 16.2933 25 16ZM20 18.6667C18.5333 18.6667 17.3333 17.4667 17.3333 16C17.3333 14.5333 18.5333 13.3333 20 13.3333C21.4667 13.3333 22.6667 14.5333 22.6667 16C22.6667 17.4667 21.4667 18.6667 20 18.6667Z" fill="currentColor" />
            </svg><h1 className="text-[24px] sm:text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-none">
              Doctor Management
            </h1>
          </div>
          <p className="text-[18px] text-gray-text-dim2">View, edit, and manage all platform doctors.</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]" />
          <input
            type="search"
            aria-label="Search doctors"
            placeholder="Search doctors…"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full sm:max-w-[275px] pl-9 pr-4 py-2.5 text-[16px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-[#F6F7F8] dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#333CF5]/30 focus:border-[#333CF5] transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button onClick={handleExport} className="flex justify-center items-center gap-2 px-6 py-3 text-[16px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer">
            <FiUpload /> Export
          </button>
          <button onClick={() => navigate('/admin/doctors/create')} className="flex justify-center items-center gap-2 px-6 py-3 text-[16px] font-semibold text-white bg-[#333CF5] rounded-full hover:bg-[#0913C3] transition-all shadow-md cursor-pointer">
            <FiPlus /> Add Doctor
          </button>
        </div>
      </div>

      {/* في حالة البحث لا يعطي نتائج */}
      {filteredDoctors.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400 text-[18px]">No results match your search criteria.</p>
        </div>
      ) : (
        <DataTable
          data={filteredDoctors}
          selectedItems={selectedIds}
          onToggle={toggleSelect}
          onDeleteIndividual={openSingleDeleteModal}
          onEdit={(item) => navigate(`/admin/doctors/edit/${item.id}`)}
          onBulkDelete={openBulkDeleteModal}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      <ConfirmModal
        isOpen={modal.open}
        title={modal.type === 'bulk' ? `Delete ${selectedIds.length} Doctors?` : 'Delete Doctor?'}
        desc="This action is permanent and cannot be undone."
        onCancel={() => setModal({ open: false, type: 'single', targetId: null })}
        onConfirm={handleDeleteConfirm}
      />
    </section>
  );
}