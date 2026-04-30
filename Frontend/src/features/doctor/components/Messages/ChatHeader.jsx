import { MdMenu } from 'react-icons/md';

const ChatHeader = ({ doctor, onOpenSidebar, onStartVideo, canStartVideo = true }) => {
  return (
    <header className="sticky top-0 z-10 lg:static flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-700 shrink-0 lg:rounded-tr-3xl">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open sidebar"
          className="cursor-pointer lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={onOpenSidebar}
        >
          <MdMenu className="text-xl text-[var(--msg-muted-2)]" />
        </button>
        <div className="relative shrink-0">
          <img
            src={doctor?.img}
            alt={doctor?.name ? `Avatar of ${doctor.name}` : 'Doctor avatar'}
            className="w-9 h-9 rounded-full object-cover"
          />
          {doctor?.status === 'online' ? (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-[#111827]" />
          ) : (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white dark:border-[#111827]" />
          )}
        </div>
        <div>
          <p className="text-[18px] font-bold text-black-main-text dark:text-[#E2E8F0]">{doctor?.name}</p>
          <p className={`text-[14px] font-semibold ${doctor?.status === 'online' ? 'text-green-500' : 'text-[var(--msg-muted)]'}`}>
            {doctor?.status === 'online' ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={onStartVideo}
          aria-label="Video call"
          disabled={!canStartVideo}
          className={`p-1.5 rounded-lg transition-colors ${canStartVideo
              ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1E293B]'
              : 'cursor-not-allowed opacity-50'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-label="Video call">
            <path d="M20.117 7.62477C19.9233 7.60239 19.7272 7.63715 19.553 7.72477L15 9.99977V13.9998L19.553 16.2748C19.7053 16.3509 19.8744 16.3868 20.0445 16.3792C20.2145 16.3717 20.3799 16.3208 20.5248 16.2315C20.6697 16.1422 20.7894 16.0173 20.8725 15.8688C20.9557 15.7203 20.9996 15.553 21 15.3828V8.61677C20.9997 8.37201 20.9097 8.13585 20.747 7.95302C20.5842 7.7702 20.3601 7.65341 20.117 7.62477Z" className="fill-black-main-text dark:fill-[#E2E8F0]" />
            <path d="M5 5C3.355 5 2 6.355 2 8V16C2 17.645 3.355 19 5 19H13C14.645 19 16 17.645 16 16V8C16 6.355 14.645 5 13 5H5Z" className="fill-black-main-text dark:fill-[#E2E8F0]" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
