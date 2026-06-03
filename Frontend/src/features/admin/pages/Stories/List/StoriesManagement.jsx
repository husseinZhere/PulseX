import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa';
import {
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2';
import { FaBookOpen } from 'react-icons/fa6';
import ConfirmModal from '../../../components/ConfirmModal/ConfirmModal';
import Toast from '../../../../../components/Toast/Toast';
import { applyStoriesSeo } from '../shared/seo';
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  TAG_OPTIONS,
} from '../shared/storiesMockData';
import {
  getAllStoriesAdmin,
  hideStoryAdmin,
  deleteStoryAdmin,
} from '../../../../../services/storyService';
import { resolveFileUrl } from '../../../../../utils/api';

const PAGE_SIZE = 3;
const MAX_VISIBLE_PAGES = 5;

const toStoryStatus = (story) => {
  const explicitStatus = String(story?.status || '').toLowerCase();
  const isHidden = Boolean(story?.isHidden ?? story?.IsHidden);
  const isPublished = Boolean(story?.isPublished ?? story?.IsPublished ?? true);

  if (explicitStatus === 'deleted') return 'Deleted';
  if (isHidden || explicitStatus === 'hidden') return 'Hidden';
  if (!isPublished) return 'Deleted';
  return 'Published';
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

export default function StoriesManagementPage() {
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [tag, setTag] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('Normal');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, story: null, mode: 'single' });
  const [toast, setToast] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    applyStoriesSeo({
      title: 'Stories Management | PulseX Admin',
      description: 'Manage patient stories, moderate content, and review story activity in the admin panel.',
      keywords: 'PulseX admin stories, story moderation, patient stories management',
    });
  }, []);

  useEffect(() => {
    let ignore = false;

    getAllStoriesAdmin()
      .then((data) => {
        if (ignore) return;

        const raw = Array.isArray(data) ? data : (data?.items || data?.data || []);
        const normalized = raw.map((s) => ({
          id: s.id ?? s.storyId,
          title: s.title || 'Untitled',
          desc: s.snippet || s.contentPreview || s.content?.slice(0, 140) || '',
          cover: resolveFileUrl(s.imageUrl || s.coverImage || s.cover || ''),
          author: s.patientName || s.authorName || s.author || 'Anonymous',
          avatar: resolveFileUrl(s.patientAvatar || s.authorAvatar || s.avatar || ''),
          date: s.publishedAt
            ? new Date(s.publishedAt).toLocaleDateString('en-US')
            : (s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US') : ''),
          status: toStoryStatus(s),
          tags: normalizeTags(s.tags),
        }));

        setStories(normalized);
      })
      .catch((err) => {
        console.error('Load stories failed', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const showToast = (title, message) => {
    setToast({ visible: true, title, message });
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3000);
  };

  const filtered = useMemo(() => {
    let list = [...stories];

    if (tag !== 'All') {
      list = list.filter((story) => (story.tags || []).includes(tag));
    }
    if (status !== 'All') {
      list = list.filter((story) => story.status === status);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (story) => story.title.toLowerCase().includes(term) || story.author.toLowerCase().includes(term)
      );
    }
    if (sort === 'Newest') {
      list = list.reverse();
    }
    if (sort === 'Oldest') {
      list = [...list].reverse();
    }

    return list;
  }, [stories, tag, status, search, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const liveStats = useMemo(
    () => ({
      total: stories.length,
      published: stories.filter((story) => story.status === 'Published').length,
      hidden: stories.filter((story) => story.status === 'Hidden').length,
      deleted: stories.filter((story) => story.status === 'Deleted').length,
    }),
    [stories]
  );

  const deletableStoriesCount = useMemo(
    () => stories.filter((story) => story.status !== 'Deleted').length,
    [stories]
  );

  const buildPageNums = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const pages = Array.from({ length: MAX_VISIBLE_PAGES }, (_, index) => index + 1);
    return [...pages, '...', totalPages];
  };

  const handlePageChange = (targetPage) => {
    if (targetPage >= 1 && targetPage <= totalPages) {
      setPage(targetPage);
    }
  };

  const handleRowClick = (story) => {
    navigate(`/admin/stories/${story.id}`);
  };

  const handleToggleHide = async (event, story) => {
    event.stopPropagation();
    try {
      const response = await hideStoryAdmin(story.id);
      const apiStory = response?.data || response?.story || null;
      const nextStatus = apiStory ? toStoryStatus(apiStory) : (story.status === 'Hidden' ? 'Published' : 'Hidden');

      setStories((previous) =>
        previous.map((item) => (item.id === story.id ? { ...item, status: nextStatus } : item))
      );
      showToast(
        nextStatus === 'Hidden' ? 'Story Hidden Successfully' : 'Story Unhidden Successfully',
        'Your changes have been saved successfully.'
      );
    } catch (err) {
      showToast('Action Failed', err?.response?.data?.message || err?.message || 'Operation failed');
    }
  };

  const handleDeleteClick = (event, story) => {
    event.stopPropagation();
    setDeleteModal({ open: true, story, mode: 'single' });
  };

  const handleDeleteAllClick = () => {
    if (deletableStoriesCount === 0) {
      return;
    }
    setDeleteModal({ open: true, story: null, mode: 'all' });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.mode === 'all') {
      try {
        const deletable = stories.filter((s) => s.status !== 'Deleted');
        await Promise.all(deletable.map((s) => deleteStoryAdmin(s.id)));
        setStories((previous) => previous.map((item) => ({ ...item, status: 'Deleted' })));
        setDeleteModal({ open: false, story: null, mode: 'single' });
        setPage(1);
        showToast('All Stories Deleted Successfully', 'Your changes have been saved successfully.');
      } catch (err) {
        showToast('Delete Failed', err?.response?.data?.message || err?.message || 'Operation failed');
        setDeleteModal({ open: false, story: null, mode: 'single' });
      }
      return;
    }

    if (!deleteModal.story) return;

    try {
      await deleteStoryAdmin(deleteModal.story.id);
      setStories((previous) =>
        previous.map((item) =>
          item.id === deleteModal.story.id ? { ...item, status: 'Deleted' } : item
        )
      );
      setDeleteModal({ open: false, story: null, mode: 'single' });
      showToast('Story Deleted Successfully', 'Your changes have been saved successfully.');
    } catch (err) {
      showToast('Delete Failed', err?.response?.data?.message || err?.message || 'Operation failed');
      setDeleteModal({ open: false, story: null, mode: 'single' });
    }
  };

  const pageNumbers = buildPageNums();

  return (
    <main className="h-full" aria-label="Stories management page">
      <section className="flex flex-col gap-6 p-6" aria-labelledby="stories-management-title">
        <Toast
          visible={toast.visible}
          title={toast.title}
          message={toast.message}
          type="success"
          onClose={() => setToast((current) => ({ ...current, visible: false }))}
        />

        <ConfirmModal
          isOpen={deleteModal.open}
          title={deleteModal.mode === 'all' ? 'Delete All Stories?' : 'Delete Story?'}
          desc={
            deleteModal.mode === 'all'
              ? 'Are you sure you want to delete all stories? This action is permanent.'
              : 'Are you sure you want to delete this story? This action is permanent.'
          }
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, story: null, mode: 'single' })}
        />

        {/* Header */}
        <motion.header
          className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="flex flex-col gap-1">
            <div className="mb-2 flex items-center gap-2">
              <HiOutlinePencilSquare className="text-[22px] text-black-main-text dark:text-[#E2E8F0]" aria-hidden="true" />
              <h1
                id="stories-management-title"
                className="text-[24px] sm:text-[24px] font-bold text-black-main-text dark:text-[#E2E8F0] leading-none"
              >
                Patient Stories
              </h1>
            </div>
            <p className="text-[18px] text-gray-text-dim2">
              Read and share inspiring patient journeys.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={handleDeleteAllClick}
            disabled={deletableStoriesCount === 0}
            whileHover={deletableStoriesCount > 0 ? { scale: 1.04 } : {}}
            whileTap={deletableStoriesCount > 0 ? { scale: 0.97 } : {}}
            className={`inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              deletableStoriesCount === 0
                ? 'cursor-not-allowed border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0B1220] text-gray-400 dark:text-gray-500'
                : 'cursor-pointer bg-red-600 dark:bg-red-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.4)] hover:bg-red-700 dark:hover:bg-red-500 border border-red-700 dark:border-red-500'
            }`}
          >
            <HiOutlineTrash size={16} />
            Delete All Stories
          </motion.button>
        </motion.header>

        {/* Stat cards with stagger */}
        <motion.section
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Stories summary statistics"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <StatCard label="Total Stories"     value={liveStats.total}     icon={<FaBookOpen />} iconBg="#EEF2FF" iconColor="#333CF5" />
          <StatCard label="Published Stories" value={liveStats.published} icon={<FaEye />}      iconBg="#ECFDF5" iconColor="#16A34A" />
          <StatCard label="Hidden Stories"    value={liveStats.hidden}    icon={<FaEyeSlash />} iconBg="#FFF7ED" iconColor="#757575" />
          <StatCard label="Deleted Stories"   value={liveStats.deleted}   icon={<FaTrash />}    iconBg="#FEF2F2" iconColor="#EF4444" />
        </motion.section>

        <section className="flex flex-col flex-wrap items-start gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-[#F8FAFC] dark:bg-[#0B1220] p-3 sm:flex-row sm:items-center sm:p-4" aria-label="Stories filters">
          {[
            { label: 'Tags:', value: tag, setter: setTag, options: TAG_OPTIONS },
            { label: 'Status:', value: status, setter: setStatus, options: STATUS_OPTIONS },
            { label: 'Sort By:', value: sort, setter: setSort, options: SORT_OPTIONS },
          ].map(({ label, value, setter, options }) => (
            <div
              key={label}
              className="order-2 flex w-full items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] px-3 py-1 sm:order-1 sm:w-auto"
            >
              <label className="min-w-12 whitespace-nowrap text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                {label}
              </label>
              <div className="relative flex-1 sm:min-w-[120px]">
                <select
                  value={value}
                  onChange={(event) => {
                    setter(event.target.value);
                    setPage(1);
                  }}
                  className="w-full cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pl-1 pr-8 text-[13px] font-medium text-black-main-text dark:text-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/30"
                >
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <HiChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[15px] text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}

          <div className="relative order-1 w-full sm:order-2 sm:ml-auto sm:w-auto">
            <HiOutlineMagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search stories..."
              aria-label="Search stories"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] py-2 pl-9 pr-4 text-[14px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#155dfc]/30 sm:w-64"
            />
          </div>
        </section>

        <section className="w-full overflow-visible bg-white dark:bg-[#111827] sm:overflow-x-auto" aria-label="Stories table">
          <table className="w-full min-w-full border-collapse sm:min-w-175">
            <thead className="hidden sm:table-header-group">
              <tr className="bg-[#333CF5] text-white">
                <th className="px-6 py-5 text-center text-[12px] font-normal uppercase tracking-wider whitespace-nowrap">Story</th>
                <th className="px-4 py-5 text-center text-[12px] font-normal uppercase tracking-wider whitespace-nowrap">Author</th>
                <th className="px-4 py-5 text-center text-[12px] font-normal uppercase tracking-wider whitespace-nowrap">Date Published</th>
                <th className="px-4 py-5 text-center text-[12px] font-normal uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-5 text-center text-[12px] font-normal uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="wait">
              {paginated.map((story, index) => (
                <motion.tr
                  key={story.id}
                  onClick={() => handleRowClick(story)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, delay: index * 0.06, ease: 'easeOut' }}
                  className={`block sm:table-row rounded-[14px] sm:rounded-none border-2 border-gray-100 dark:border-gray-700 sm:border-0 mb-3 sm:mb-0 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-[#111827]' : 'bg-[#F9FAFB] dark:bg-[#0F172A]'
                    } hover:bg-[#EFF6FF]/60 dark:hover:bg-[#1E3A8A]/25`}
                >
                  <td className="block px-6 py-6 text-left sm:table-cell sm:py-8">
                    <article className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                      {story.cover ? (
                        <img
                          src={story.cover}
                          alt={story.title}
                          className="h-20 w-16 shrink-0 rounded-xl border border-gray-100 dark:border-gray-800 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-lg font-bold text-gray-400 dark:border-gray-800 dark:bg-[#0F172A]">
                          {story.title?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col gap-2">
                        <h3 className="text-[17px] font-bold leading-tight text-black-main-text dark:text-[#E2E8F0]">{story.title}</h3>
                        <p className="max-w-87.5 text-[14px] leading-relaxed text-gray-text-dim2 dark:text-gray-400">{story.desc}</p>
                      </div>
                    </article>
                  </td>

                  <td className="block px-4 py-4 sm:table-cell sm:py-8">
                    <div className="flex items-center justify-center gap-3">
                      {story.avatar ? (
                        <img
                          src={story.avatar}
                          alt={story.author}
                          className="h-8 w-8 shrink-0 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-[#EEF2FF] text-[12px] font-bold text-[#333CF5] dark:border-gray-700 dark:bg-[#1E293B] dark:text-[#93C5FD]">
                          {story.author?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                      )}
                      <span className="whitespace-nowrap text-[16px] font-semibold text-black-main-text dark:text-[#E2E8F0]">{story.author}</span>
                    </div>
                  </td>

                  <td className="block px-4 py-4 text-center text-[14px] font-medium text-gray-500 dark:text-gray-400 sm:table-cell sm:py-8">
                    {story.date}
                  </td>

                  <td className="block px-4 py-4 text-center sm:table-cell sm:py-8">
                    <span
                      className={`inline-block rounded-full px-4 py-1.5 text-[12px] font-bold ${story.status === 'Published'
                        ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D]/40 dark:text-[#86EFAC]'
                        : story.status === 'Hidden'
                          ? 'bg-gray-100 text-gray-text-dim2 dark:bg-gray-700/40 dark:text-gray-300'
                          : 'bg-[#FEF2F2] text-[#EF4444] dark:bg-[#7F1D1D]/40 dark:text-[#FCA5A5]'
                        }`}
                    >
                      {story.status}
                    </span>
                  </td>

                  <td className="block px-4 py-4 text-center sm:table-cell sm:py-8" onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={(event) => handleToggleHide(event, story)}
                        title={story.status === 'Hidden' ? 'Unhide Story' : 'Hide Story'}
                        className={`h-10 w-10 cursor-pointer flex items-center justify-center transition-all ${story.status === 'Hidden'
                          ? 'text-[#3335cf] hover:text-[#2628a0]'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                      >
                        {story.status === 'Hidden' ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                      </button>
                      <button
                        onClick={(event) => handleDeleteClick(event, story)}
                        className="h-10 w-10 cursor-pointer flex items-center justify-center rounded-xl text-red-500 hover:text-red-600 transition-all"
                      >
                        <HiOutlineTrash size={20} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 px-4 py-3 sm:flex-row">
            <span className="w-full text-center text-[14px] text-gray-400 sm:w-auto sm:text-left">
              Showing {paginated.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} stories
            </span>
            <nav className="flex items-center gap-1" aria-label="Stories pagination">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiChevronLeft size={14} />
              </button>
              {pageNumbers.map((pageNum, index) =>
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="hidden px-1 text-[14px] text-gray-400 sm:inline">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[12px] font-semibold transition-colors sm:flex ${page === pageNum
                      ? 'bg-[#155dfc] text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E293B]'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => handlePageChange(page + 1)}
                className="h-10 w-10 cursor-pointer flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <HiChevronRight size={14} />
              </button>
            </nav>
          </div>
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon, iconBg, iconColor }) {
  return (
    <motion.article
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      className="flex w-full items-center justify-between rounded-[14px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111827] px-4 py-8 shadow-xl"
    >
      <div className="flex flex-col gap-1">
        <p className="mb-2 text-[14px] font-normal tracking-wide text-gray-text-dim2 dark:text-gray-400">{label}</p>
        <p className="text-[30px] font-bold leading-none text-black-main-text dark:text-[#E2E8F0]">{value.toLocaleString()}</p>
      </div>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[18px]"
        style={{ background: iconBg, color: iconColor }}
        aria-hidden="true"
      >
        {icon}
      </div>
    </motion.article>
  );
}
