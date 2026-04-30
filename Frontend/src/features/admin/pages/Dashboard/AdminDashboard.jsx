import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LuStethoscope, LuUsers, LuUserPlus, LuUserX } from 'react-icons/lu';
import { MdPersonAddAlt } from 'react-icons/md';

import StatCard from './components/StatCard';
import Skeleton from './components/Skeleton';
import './AdminDashboard.css';
import { getAdminDashboard, getAllUsers } from '../../../../services/adminService';
import { resolveFileUrl } from '../../../../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    stats: { totalDoctors: 0, totalPatients: 0, newDoctors: 0, newPatients: 0 },
    doctors: [],
    patients: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashboard, users] = await Promise.all([
          getAdminDashboard().catch(() => null),
          getAllUsers().catch(() => []),
        ]);
        if (ignore) return;

        const allUsers = Array.isArray(users) ? users : [];
        const doctors = allUsers
          .filter((u) => u.role === 'Doctor')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((u) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            image: resolveFileUrl(u.profilePicture || ''),
          }));
        const patients = allUsers
          .filter((u) => u.role === 'Patient')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((u) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            image: resolveFileUrl(u.profilePicture || ''),
          }));

        const stats = dashboard
          ? {
              totalDoctors: dashboard.totalDoctors ?? 0,
              totalPatients: dashboard.totalPatients ?? 0,
              newDoctors: doctors.length,
              newPatients: patients.length,
            }
          : { totalDoctors: 0, totalPatients: 0, newDoctors: 0, newPatients: 0 };

        setData({ stats, doctors, patients });
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, []);

  return (
    <section className="admin-dash-root flex flex-col gap-6 lg:gap-8" aria-label="Admin Dashboard">
      <div className="admin-hero relative overflow-hidden rounded-[22px] p-5 sm:p-8">
        <div aria-hidden="true" className="admin-hero-orb admin-hero-orb-a" />
        <div aria-hidden="true" className="admin-hero-orb admin-hero-orb-b" />
        <div aria-hidden="true" className="admin-hero-grid" />

        <div className="relative z-10">
          <div className="admin-fade-up admin-delay-0 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="admin-kicker">Control Center</p>
              <h1 className="text-[30px] sm:text-[42px] font-bold text-white leading-tight">Welcome Back <span aria-hidden="true">👋</span></h1>
              <p className="text-base sm:text-lg text-white/80 mt-2 max-w-[680px]">Manage doctors and patients across the PulseX platform with live operational visibility.</p>
            </div>
            <div className="admin-live-pill" role="status" aria-label="Live metrics sync status">
              <span className="admin-live-dot" aria-hidden="true" />
              Live Metrics Sync
            </div>
          </div>

          <div className="admin-fade-up admin-delay-1 flex flex-wrap gap-3 mt-5 mb-6">
            <button
              onClick={() => navigate('/admin/doctors/create')}
              className="admin-cta-primary cursor-pointer"
            >
              <MdPersonAddAlt className="text-lg" />
              Add Doctor
            </button>
            <button
              onClick={() => navigate('/admin/patients/create')}
              className="admin-cta-secondary cursor-pointer"
            >
              <MdPersonAddAlt className="text-lg" />
              Add Patient
            </button>
          </div>

          <div className="admin-kpi-grid grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard
              index={0}
              icon={<LuStethoscope />}
              label="Total Doctors"
              value={data.stats.totalDoctors}
              sub="Active practitioners"
              gradient="linear-gradient(135deg,#60A5FA 0%,#2563EB 100%)"
            />
            <StatCard
              index={1}
              icon={<LuUsers />}
              label="Total Patients"
              value={data.stats.totalPatients}
              sub="Registered users"
              gradient="linear-gradient(135deg,#34D399 0%,#059669 100%)"
            />
            <StatCard
              index={2}
              icon={<LuUserPlus />}
              label="New Doctors"
              value={data.stats.newDoctors}
              sub="Last 7 days"
              gradient="linear-gradient(135deg,#C084FC 0%,#9333EA 100%)"
            />
            <StatCard
              index={3}
              icon={<LuUserPlus />}
              label="New Patients"
              value={data.stats.newPatients}
              sub="Last 7 days"
              gradient="linear-gradient(135deg,#FB923C 0%,#EA580C 100%)"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="admin-panel rounded-[18px] p-4 sm:p-5 min-h-[280px] flex flex-col admin-fade-up admin-delay-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-black-main-text dark:text-[#E2E8F0]">Recent Doctors</h2>
            <button
              className="admin-view-link border-none cursor-pointer"
              onClick={() => navigate('/admin/doctors/list')}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col">{[1, 2, 3].map((i) => <Skeleton key={i} />)}</div>
          ) : data.doctors.length === 0 ? (
            <div className="admin-empty-state flex-1 flex flex-col items-center justify-center gap-3 text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#8EC5FF] text-xl">
                <LuUserX />
              </div>
              <h3 className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">No Doctors Added Yet</h3>
              <p className="text-[14px] text-gray-500 max-w-[240px]">
                Start building your medical team by adding doctors to the PulseX platform.
              </p>
              <button
                onClick={() => navigate('/admin/doctors/create')}
                className="admin-cta-inline flex items-center gap-1.5"
              >
                <MdPersonAddAlt /> Add First Doctor
              </button>
            </div>
          ) : (
            <ul className="flex flex-col list-none p-0 m-0 gap-1">
              {data.doctors.map((doc) => (
                <li key={doc.id} className="admin-list-row flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=EFF6FF&color=155DFC`}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                    />
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0] truncate">{doc.name}</p>
                      <p className="text-[14px] text-gray-text-dim2 dark:text-gray-400 truncate">{doc.email}</p>
                    </div>
                  </div>
                  <button
                    className="admin-inline-action shrink-0 border-none cursor-pointer self-end sm:self-auto"
                    onClick={() => navigate(`/admin/doctors/edit/${doc.id}`)}
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-panel rounded-[18px] p-4 sm:p-5 min-h-[280px] flex flex-col admin-fade-up admin-delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[20px] font-bold text-black-main-text dark:text-[#E2E8F0]">Recent Patients</h2>
            <button
              className="admin-view-link border-none cursor-pointer"
              onClick={() => navigate('/admin/patients/list')}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col">{[1, 2, 3].map((i) => <Skeleton key={i} />)}</div>
          ) : data.patients.length === 0 ? (
            <div className="admin-empty-state flex-1 flex flex-col items-center justify-center gap-3 text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#00A63E] text-xl">
                <LuUsers />
              </div>
              <h3 className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">No Patients Registered</h3>
              <p className="text-[14px] text-gray-500 max-w-[240px]">
                Your patient list is empty. Start by adding patients to the PulseX platform.
              </p>
              <button
                onClick={() => navigate('/admin/patients/create')}
                className="admin-cta-inline flex items-center gap-1.5"
              >
                <MdPersonAddAlt /> Add First Patient
              </button>
            </div>
          ) : (
            <ul className="flex flex-col list-none p-0 m-0 gap-1">
              {data.patients.map((p) => (
                <li key={p.id} className="admin-list-row flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=F0FDF4&color=059669`}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                    />
                    <div className="min-w-0">
                      <p className="text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0] truncate">{p.name}</p>
                      <p className="text-[14px] text-gray-text-dim2 dark:text-gray-400 truncate">{p.email}</p>
                    </div>
                  </div>
                  <button
                    className="admin-inline-action shrink-0 border-none cursor-pointer self-end sm:self-auto"
                    onClick={() => navigate(`/admin/patients/edit/${p.id}`)}
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
