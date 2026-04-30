import { useEffect, useMemo, useState } from 'react';
import {
  HiArrowLeftOnRectangle,
  HiArrowRightOnRectangle,
  HiChevronLeft,
  HiChevronRight,
  HiClipboardDocumentList,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiTrash,
  HiUserPlus,
  HiCheckBadge,
  HiXCircle,
  HiShieldCheck,
  HiDocumentText,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import { FILTERS, ICON_STYLES } from '../shared/activityLogsMockData';
import { getAllActivityLogs } from '../../../../../services/adminService';

const ITEMS_PER_PAGE = 10;

const ICONS = {
  create:  <HiUserPlus className="text-base" />,
  update:  <HiPencilSquare className="text-base" />,
  delete:  <HiTrash className="text-base" />,
  login:   <HiArrowRightOnRectangle className="text-base" />,
  logout:  <HiArrowLeftOnRectangle className="text-base" />,
  approve: <HiCheckBadge className="text-base" />,
  reject:  <HiXCircle className="text-base" />,
  status:  <HiShieldCheck className="text-base" />,
  record:  <HiDocumentText className="text-base" />,
  comment: <HiChatBubbleLeftRight className="text-base" />,
};

const getIcon = (type) => ICONS[type] ?? ICONS.create;

export default function ActivityLogsView() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const rawLogs = await getAllActivityLogs();
        const list = (Array.isArray(rawLogs) ? rawLogs : []).map((log) => {
          const actionLower = (log.action || '').toLowerCase();

          // Derive filter category + icon type from action string
          let category = 'Created';
          let iconType = 'create';

          if (actionLower.includes('logout')) {
            category = 'Logout';  iconType = 'logout';
          } else if (actionLower.includes('login')) {
            category = 'Login';   iconType = 'login';
          } else if (actionLower.includes('delete') || actionLower.includes('remov')) {
            category = 'Deleted'; iconType = actionLower.includes('comment') ? 'comment' : 'delete';
          } else if (actionLower.includes('reject')) {
            category = 'Updated'; iconType = 'reject';
          } else if (actionLower.includes('approv')) {
            category = 'Updated'; iconType = 'approve';
          } else if (actionLower.includes('update') || actionLower.includes('status') || actionLower.includes('edit')) {
            category = 'Updated'; iconType = actionLower.includes('status') ? 'status' : 'update';
          } else if (actionLower.includes('creat') || actionLower.includes('add') || actionLower.includes('register')) {
            category = 'Created'; iconType = actionLower.includes('record') ? 'record' : 'create';
          }

          return {
            id: log.id,
            iconType,
            category,
            title: log.action || 'Activity',
            description: log.details || `${log.userName || ''} ${log.action || ''}`.trim(),
            timestamp: log.timestamp,
            time: log.timestamp
              ? new Date(log.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
          };
        });
        setLogs(list);
      } catch (err) {
        console.error('Failed to load activity logs', err);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesFilter = filter === 'All' || log.category === filter;
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        log.title.toLowerCase().includes(term) || log.description.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="flex flex-col gap-6 p-6" aria-label="Activity Logs">
      <style>{`
        @media (max-width: 640px) {
          .filter-chip-active {
            animation: filterDrop 260ms ease-out;
            will-change: transform, opacity;
          }
        }
        @keyframes filterDrop {
          0% { transform: translateY(-6px); opacity: 0.6; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <header className="mb-4 flex flex-col gap-1" aria-labelledby="activity-logs-title">
        <div className="mb-2 flex items-center gap-2">
          <HiClipboardDocumentList className="text-[22px] text-black-main-text dark:text-[#E2E8F0]" aria-hidden="true" />
          <h1 id="activity-logs-title" className="text-[24px] leading-none text-black-main-text dark:text-[#E2E8F0] sm:font-bold">
            Activity Logs
          </h1>
        </div>
        <p className="text-[18px] text-gray-text-dim2">
          Track recent changes, updates, and system activity.
        </p>
      </header>

      <section
        className="flex flex-col gap-3 rounded-2xl border border-[#F3F4F6] dark:border-gray-700 p-4 sm:flex-row sm:rounded-full sm:p-6"
        aria-label="Activity filters and search"
      >
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((button) => (
            <button
              key={button}
              onClick={() => {
                setFilter(button);
                setCurrentPage(1);
              }}
              className={`filter-chip cursor-pointer rounded-full px-4 py-1 text-[14px] font-normal transition-colors sm:px-6 ${filter === button
                  ? 'bg-[#333CF5] text-white filter-chip-active'
                  : 'bg-[#F6F7F8] dark:bg-[#0B1120] text-gray-text-dim2 dark:text-gray-400'
                }`}
            >
              {button}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:ml-auto sm:hidden sm:w-auto">
          <HiMagnifyingGlass
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search logs..."
            aria-label="Search activity logs"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-[10px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B1120] py-2.5 pr-4 pl-9 text-[13px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors focus:border-[#155dfc] focus:ring-2 focus:ring-[#155dfc]/30 focus:outline-none sm:w-55"
          />
        </div>
      </section>

      <section className="flex flex-col gap-2" aria-label="Activity log list">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#333CF5] border-t-transparent" />
            <p className="text-[13px] text-gray-400">Loading activities...</p>
          </div>
        ) : currentLogs.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {currentLogs.map((log) => {
              const style = ICON_STYLES[log.iconType] ?? ICON_STYLES.create;
              return (
                <li
                  key={log.id}
                  className="flex items-start gap-4 rounded-xl border border-[#F3F4F6] dark:border-gray-700 bg-white dark:bg-[#111827] p-6 transition-colors"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`}>
                    {getIcon(log.iconType)}
                  </div>
                  <article className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                      <h2 className="text-[18px] leading-snug font-semibold text-black-main-text dark:text-[#E2E8F0]">
                        {log.title}
                      </h2>
                      <span className="shrink-0 whitespace-nowrap text-[14px] text-gray-text-dim2 sm:text-right">
                        {log.time}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[16px] text-[#4B5563] dark:text-gray-300">{log.description}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center justify-center py-16 text-[13px] text-gray-400">
            No logs found matching your criteria.
          </div>
        )}
      </section>

      {!isLoading && totalPages > 1 ? (
        <nav
          className="m-6 flex flex-wrap items-center justify-center gap-2 pt-1"
          aria-label="Activity logs pagination"
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <HiChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[14px] font-semibold transition-colors ${page === currentPage
                  ? 'bg-[#333CF5] text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E293B]'
                }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <HiChevronRight size={14} />
          </button>
        </nav>
      ) : null}
    </section>
  );
}