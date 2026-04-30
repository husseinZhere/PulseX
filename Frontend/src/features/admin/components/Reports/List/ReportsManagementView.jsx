import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowPath,
  HiExclamationTriangle,
  HiOutlineBookOpen,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineFlag,
  HiOutlineTrash,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';
import { useEffect } from 'react';
import Toast from '../../../../../components/Toast/Toast';
import {
  getAllReports,
  updateReportStatus,
} from '../../../../../services/reportService';
import {
  deleteStoryByAdmin,
  deleteCommentByAdmin,
} from '../../../../../services/adminService';
import { resolveFileUrl } from '../../../../../utils/api';

function DeleteContentModal({ report, onConfirm, onCancel }) {
  if (!report) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <div className="flex w-full max-w-100 flex-col gap-4 rounded-[20px] bg-white dark:bg-[#111827] p-6 shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">
          <HiExclamationTriangle />
        </div>

        <div className="text-center">
          <h2 className="text-[16px] font-bold text-black-main-text dark:text-[#E2E8F0]">Delete Content</h2>
          <p className="mt-0.5 text-[12px] text-gray-400">This action cannot be undone</p>
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl bg-[#F6F7F8] dark:bg-[#0B1120] p-4">
          <p className="text-[12px] text-gray-600 dark:text-gray-300">
            <strong>Type:</strong> {report.contentType.toLowerCase()}
          </p>
          <p className="text-[12px] text-gray-600 dark:text-gray-300">
            <strong>Author:</strong> {report.contentAuthor}
          </p>
          <p className="line-clamp-3 text-[12px] italic text-gray-500 dark:text-gray-400">"{report.contentText}"</p>
        </div>

        <p className="text-center text-[12px] text-gray-500 dark:text-gray-400">
          Are you sure you want to permanently delete this content? This will remove it from the platform and notify the author.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-[10px] bg-[#F6F7F8] dark:bg-[#0B1120] py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-[#1F2937]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-[10px] bg-red-500 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  Pending: 'bg-orange-100 text-orange-700 outline outline-[0.8px] outline-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:outline-orange-700/60',
  Reviewed: 'bg-green-100 text-green-700 outline outline-[0.8px] outline-green-200 dark:bg-green-900/30 dark:text-green-300 dark:outline-green-700/60',
  Dismissed: 'bg-gray-100 text-gray-700 outline outline-[0.8px] outline-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:outline-gray-600',
};

const CATEGORY_BADGE = {
  Spam: 'bg-purple-100 text-purple-700 outline outline-[0.8px] outline-red-200 dark:bg-purple-900/30 dark:text-purple-300 dark:outline-purple-700/60',
  Misinformation: 'bg-yellow-200 text-yellow-700 outline outline-[0.8px] outline-orange-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:outline-yellow-700/60',
  Harassment: 'bg-red-100 text-red-700 outline outline-[0.8px] outline-red-200 dark:bg-red-900/30 dark:text-red-300 dark:outline-red-700/60',
  'Inappropriate Content': 'bg-red-100 text-[#C10007] outline outline-[0.8px] outline-red-200 dark:bg-red-900/30 dark:text-red-300 dark:outline-red-700/60',
  Other: 'bg-blue-100 text-[#155DFC] outline outline-[0.8px] outline-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:outline-blue-700/60',
};

function ReportCard({ report, onMarkReviewed, onDismiss, onReopen, onDelete, onView }) {
  const isPending = report.status === 'Pending';
  const isReviewed = report.status === 'Reviewed';
  const isDismissed = report.status === 'Dismissed';

  const contentTypeIcon =
    report.contentType === 'Comment' || report.contentType === 'Reply' ? (
      <HiOutlineChatBubbleOvalLeft size={13} />
    ) : (
      <HiOutlineBookOpen size={13} />
    );

  const statusBadge = STATUS_BADGE[report.status] ?? STATUS_BADGE.Dismissed;
  const categoryBadge =
    CATEGORY_BADGE[report.category] ??
    'bg-gray-100 text-gray-600 outline outline-[0.8px] outline-gray-200 dark:bg-gray-700/40 dark:text-gray-300 dark:outline-gray-600';

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#111827] px-6 pt-6 pb-5 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] outline-[0.8px] outline-gray-200 dark:outline-gray-700">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        {report.reporterAvatar ? (
          <img
            src={report.reporterAvatar}
            alt={report.reportedBy}
            className="h-12 w-12 shrink-0 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-[#E7000B]">
            <HiOutlineFlag size={20} />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="text-[16px] leading-6 font-semibold text-black-main-text dark:text-[#E2E8F0]">
              Reported by {report.reportedBy}
            </span>
            <span className="text-[12px] font-normal text-gray-500">{report.reporterTime}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] leading-4 font-medium ${statusBadge}`}
            >
              {report.status}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] leading-4 font-medium ${categoryBadge}`}
            >
              {report.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700/40 px-3 py-1 text-[12px] leading-4 font-medium text-gray-700 dark:text-gray-300 outline-[0.8px] outline-gray-200 dark:outline-gray-600">
              {contentTypeIcon}
              {report.contentType}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[14px] text-gray-600 dark:text-gray-300">
        In story: <em className="not-italic font-medium text-gray-700 dark:text-gray-200">"{report.storyTitle}"</em>
      </p>

      <div className="flex flex-col gap-1.5 rounded-xl border border-[#FFC9C9] dark:border-red-800 bg-[#FEF2F2] dark:bg-red-900/20 px-4 py-3">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-red-700 dark:text-red-300">
          <HiExclamationTriangle className="text-red-600 dark:text-red-300" size={14} />
          Content by {report.contentAuthor}:
        </p>
        <p className="text-[14px] leading-relaxed italic text-gray-700 dark:text-gray-200">"{report.contentText}"</p>
      </div>

      <div className="flex flex-col gap-1 rounded-xl border border-[#E5E7EB] dark:border-gray-700 bg-[#F9FAFB] dark:bg-[#0B1120] px-4 py-3">
        <p className="text-[14px] font-semibold text-black-main-text dark:text-[#E2E8F0]">Report Reason:</p>
        <p className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-300">{report.reportReason}</p>
      </div>

      <div className="flex w-full flex-col flex-wrap gap-2 pt-1 sm:flex-row">
        <button
          onClick={onView}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#155DFC] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#0913C3] sm:flex-none"
        >
          <HiOutlineEye size={14} /> View Content
        </button>

        {isPending ? (
          <>
            <button
              onClick={onDelete}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#E7000B] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#C10007] sm:flex-none"
            >
              <HiOutlineTrash size={14} /> Delete Content
            </button>
            <button
              onClick={onMarkReviewed}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#00A63E] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#008236] sm:flex-none"
            >
              <HiOutlineCheckCircle size={14} /> Mark Reviewed
            </button>
            <button
              onClick={onDismiss}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-600 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-gray-700 sm:flex-none"
            >
              <HiOutlineXCircle size={14} /> Dismiss
            </button>
          </>
        ) : null}

        {isReviewed ? (
          <>
            <button
              onClick={onDelete}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#E7000B] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#C10007] sm:flex-none"
            >
              <HiOutlineTrash size={14} /> Delete Content
            </button>
            <button
              onClick={onDismiss}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#1E293B] px-4 py-2 text-[14px] font-semibold text-[#4A5565] dark:text-gray-200 transition-colors hover:bg-[#E5E7EB] dark:hover:bg-[#334155] sm:flex-none"
            >
              <HiOutlineXCircle size={14} /> Dismiss
            </button>
            <button
              onClick={onReopen}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#FFEDD4] dark:bg-orange-900/30 px-4 py-2 text-[12px] font-semibold text-[#CA3500] dark:text-orange-300 transition-colors hover:bg-orange-200 dark:hover:bg-orange-800/40 sm:flex-none"
            >
              <HiArrowPath size={14} /> Reopen
            </button>
          </>
        ) : null}

        {isDismissed ? (
          <button
            onClick={onReopen}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#FFEDD4] dark:bg-orange-900/30 px-4 py-2 text-[12px] font-semibold text-[#CA3500] dark:text-orange-300 transition-colors hover:bg-orange-200 dark:hover:bg-orange-800/40 sm:flex-none"
          >
            <HiArrowPath size={14} /> Re-open
          </button>
        ) : null}
      </div>
    </article>
  );
}

const normalizeReport = (r) => ({
  id: r.id,
  reportedBy: r.reporterName || 'Unknown',
  reporterAvatar: resolveFileUrl(r.reporterAvatar || ''),
  reporterTime: r.timeAgo || (r.createdAt ? new Date(r.createdAt).toLocaleString() : ''),
  status: r.status || 'Pending',
  category: r.category || 'Other',
  contentType: r.targetType || 'Story',
  contentAuthor: r.targetAuthorName || r.contentAuthor || 'Unknown',
  contentText: r.targetContentSnapshot || r.content || '',
  storyTitle: r.storyTitle || '',
  storyId: r.storyId ?? (r.targetType === 'Story' ? r.targetId : null),
  targetId: r.targetId,
  targetType: r.targetType,
  reportReason: r.reason || r.reportReason || '',
});

export default function ReportsManagementView() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3000);
  };

  const loadReports = async () => {
    try {
      const data = await getAllReports();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setReports(list.map(normalizeReport));
    } catch (err) {
      console.error('Load reports failed', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((report) => report.status === 'Pending').length,
      reviewed: reports.filter((report) => report.status === 'Reviewed').length,
      dismissed: reports.filter((report) => report.status === 'Dismissed').length,
    }),
    [reports]
  );

  const updateStatus = async (id, status) => {
    try {
      await updateReportStatus(id, { status });
      setReports((previous) =>
        previous.map((report) => (report.id === id ? { ...report, status } : report))
      );
      showToast(`Report ${status}`, `The report has been marked as ${status}.`);
    } catch (err) {
      showToast('Action Failed', err?.response?.data?.message || err?.message || 'Operation failed');
    }
  };

  const handleMarkReviewed = (id) => updateStatus(id, 'Reviewed');
  const handleDismiss = (id) => updateStatus(id, 'Dismissed');
  const handleReopen = (id) => updateStatus(id, 'Pending');

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.targetType === 'Comment') {
        await deleteCommentByAdmin(deleteTarget.targetId, 'Removed via report');
      } else {
        await deleteStoryByAdmin(deleteTarget.targetId || deleteTarget.storyId, 'Removed via report');
      }
      setReports((previous) => previous.filter((report) => report.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Content Deleted', 'The reported content has been permanently removed.');
    } catch (err) {
      showToast('Delete Failed', err?.response?.data?.message || err?.message || 'Operation failed');
      setDeleteTarget(null);
    }
  };

  const handleViewContent = (report) => {
    if (!report.storyId) return;
    if (report.targetType === 'Comment') {
      navigate(`/admin/stories/${report.storyId}/comments?highlight=${report.targetId}`);
    } else {
      navigate(`/admin/stories/${report.storyId}`);
    }
  };

  return (
    <section className="flex flex-col gap-6 p-6" aria-label="Reports Management">
      <Toast
        visible={toast.visible}
        title={toast.title}
        message={toast.message}
        type="success"
        onClose={() => setToast((current) => ({ ...current, visible: false }))}
      />

      <DeleteContentModal
        report={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <header className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 text-black-main-text dark:text-[#E2E8F0]">
          <HiOutlineFlag className="shrink-0 text-[24px]" aria-hidden="true" />
          <h1 className="text-[24px] leading-tight sm:font-bold">Reports Management</h1>
        </div>
        <p className="text-[18px] leading-relaxed text-gray-text-dim2">
          Review and manage reported content from the community.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Report statistics">
        {[
          {
            label: 'Total Reports',
            value: stats.total,
            icon: <HiOutlineFlag className="text-[22px]" />,
            iconBg: 'bg-blue-50 dark:bg-blue-900/30',
            iconColor: 'text-[#155DFC] dark:text-blue-300',
            bar: 'bg-[#155DFC]',
            glow: 'hover:shadow-[0_8px_32px_rgba(21,93,252,0.18)]',
          },
          {
            label: 'Pending Review',
            value: stats.pending,
            icon: <HiOutlineClock className="text-[22px]" />,
            iconBg: 'bg-orange-50 dark:bg-orange-900/30',
            iconColor: 'text-orange-600 dark:text-orange-300',
            bar: 'bg-orange-500',
            glow: 'hover:shadow-[0_8px_32px_rgba(234,88,12,0.18)]',
          },
          {
            label: 'Reviewed',
            value: stats.reviewed,
            icon: <FiCheckCircle className="text-[20px]" />,
            iconBg: 'bg-green-50 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-300',
            bar: 'bg-green-500',
            glow: 'hover:shadow-[0_8px_32px_rgba(22,163,74,0.18)]',
          },
          {
            label: 'Dismissed',
            value: stats.dismissed,
            icon: <HiOutlineXCircle className="text-[22px]" />,
            iconBg: 'bg-gray-100 dark:bg-gray-700/40',
            iconColor: 'text-gray-500 dark:text-gray-300',
            bar: 'bg-gray-400',
            glow: 'hover:shadow-[0_8px_32px_rgba(75,85,99,0.15)]',
          },
        ].map(({ label, value, icon, iconBg, iconColor, bar, glow }, index) => (
          <motion.article
            key={label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`relative flex flex-col gap-3 rounded-2xl bg-white dark:bg-[#111827] p-5 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden transition-shadow duration-300 ${glow}`}
          >
            <div className="flex items-start justify-between">
              <motion.div
                whileHover={{ scale: 1.12, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
              >
                {icon}
              </motion.div>
              <motion.span
                key={value}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, delay: index * 0.08 + 0.15, type: 'spring', stiffness: 260 }}
                className="text-[30px] font-extrabold text-black-main-text dark:text-[#E2E8F0] leading-none"
              >
                {value}
              </motion.span>
            </div>
            <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 leading-tight">{label}</p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
              className={`absolute bottom-0 left-0 right-0 h-[3px] ${bar} rounded-b-2xl`}
            />
          </motion.article>
        ))}
      </section>

      <section className="flex flex-col gap-4" aria-label="Reports list">
        {reports.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[13px] text-gray-400">
            No reports found.
          </div>
        ) : (
          reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
            >
              <ReportCard
                report={report}
                onMarkReviewed={() => handleMarkReviewed(report.id)}
                onDismiss={() => handleDismiss(report.id)}
                onReopen={() => handleReopen(report.id)}
                onDelete={() => setDeleteTarget(report)}
                onView={() => handleViewContent(report)}
              />
            </motion.div>
          ))
        )}
      </section>
    </section>
  );
}