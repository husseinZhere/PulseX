import { MdSearch } from 'react-icons/md';

const MessagesSidebar = ({
  doctors,
  activeId,
  search,
  onSearch,
  onSelect,
  sidebarOpen,
}) => {
  return (
    <aside
      className={`absolute lg:relative z-30 top-0 left-0 h-full w-[85vw] max-w-[320px] sm:w-80 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex flex-col rounded-tl-3xl rounded-bl-3xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      aria-label="Messages sidebar"
    >
      <header className="p-[24px] flex items-center gap-3 px-4 pt-4 pb-0 shrink-0">
        <span className="w-6 h-6 flex items-center justify-center" aria-label="Messages">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M1.06519 4.254C1.10873 4.17695 1.17194 4.11284 1.24837 4.06822C1.32479 4.02359 1.41169 4.00005 1.50019 4H19.5002C20.4284 4 21.3187 4.36875 21.9751 5.02513C22.6314 5.6815 23.0002 6.57174 23.0002 7.5V16.5C23.0002 17.4283 22.6314 18.3185 21.9751 18.9749C21.3187 19.6313 20.4284 20 19.5002 20H7.50019C6.57193 20 5.68169 19.6313 5.02532 18.9749C4.36894 18.3185 4.00019 17.4283 4.00019 16.5V9.638L1.07119 4.758C1.02564 4.68205 1.00109 4.59536 1.00004 4.50681C0.998981 4.41826 1.02147 4.33101 1.06519 4.254ZM7.50019 7.25C7.30128 7.25 7.11051 7.32902 6.96986 7.46967C6.82921 7.61032 6.75019 7.80109 6.75019 8C6.75019 8.19891 6.82921 8.38968 6.96986 8.53033C7.11051 8.67098 7.30128 8.75 7.50019 8.75H19.5002C19.6991 8.75 19.8899 8.67098 20.0305 8.53033C20.1712 8.38968 20.2502 8.19891 20.2502 8C20.2502 7.80109 20.1712 7.61032 20.0305 7.46967C19.8899 7.32902 19.6991 7.25 19.5002 7.25H7.50019ZM7.50019 10.75C7.30128 10.75 7.11051 10.829 6.96986 10.9697C6.82921 11.1103 6.75019 11.3011 6.75019 11.5C6.75019 11.6989 6.82921 11.8897 6.96986 12.0303C7.11051 12.171 7.30128 12.25 7.50019 12.25H19.5002C19.6991 12.25 19.8899 12.171 20.0305 12.0303C20.1712 11.8897 20.2502 11.6989 20.2502 11.5C20.2502 11.3011 20.1712 11.1103 20.0305 10.9697C19.8899 10.829 19.6991 10.75 19.5002 10.75H7.50019ZM6.75019 15C6.75019 14.8011 6.82921 14.6103 6.96986 14.4697C7.11051 14.329 7.30128 14.25 7.50019 14.25H16.0002C16.1991 14.25 16.3899 14.329 16.5305 14.4697C16.6712 14.6103 16.7502 14.8011 16.7502 15C16.7502 15.1989 16.6712 15.3897 16.5305 15.5303C16.3899 15.671 16.1991 15.75 16.0002 15.75H7.50019C7.30128 15.75 7.11051 15.671 6.96986 15.5303C6.82921 15.3897 6.75019 15.1989 6.75019 15Z" className="fill-black-main-text" />
          </svg>
        </span>
        <h2 className="text-[24px] font-medium text-black-main-text dark:text-[#E2E8F0] leading-7">Messages</h2>
      </header>

      <section className="px-4 pt-3 pb-3 shrink-0" aria-label="Search doctors">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-3xl px-3 py-2.5 h-11">
          <MdSearch className="text-gray-400 dark:text-gray-500 shrink-0 text-[16px]" aria-label="Search" />
          <input
            type="text"
            placeholder="Search doctor..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-[14px] text-black-main-text dark:text-[#E2E8F0] placeholder:text-gray-400 dark:placeholder:text-gray-500 font-normal"
          />
        </div>
      </section>

      <section className="flex-1 overflow-y-auto" aria-label="Doctors list">
        {doctors.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1E293B] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 leading-relaxed">
              No doctors yet. Book an appointment to unlock chat.
            </p>
          </div>
        )}
        {doctors.map((doc) => {
          const isActive = doc.id === activeId;
          return (
            <article
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors min-h-[5rem] ${isActive ? 'bg-indigo-50 dark:bg-[#1E293B]/60 border-r-4 border-[#333CF5]' : 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1E293B]/40'
                }`}
            >
              <div className="relative shrink-0">
                <img
                  src={doc.img}
                  alt={`Avatar of ${doc.name}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {doc.status === 'online' ? (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-[#111827]" />
                ) : (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-gray-400 border-2 border-white dark:border-[#111827]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[14px] font-semibold truncate ${isActive ? 'text-black-main-text dark:text-[#E2E8F0]' : 'text-gray-800 dark:text-gray-200'}`}>
                    {doc.name}
                  </span>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 shrink-0 ml-2">{doc.time}</span>
                </div>
                <p className={`text-[12px] truncate mt-0.5 ${isActive ? 'text-[#333CF5] dark:text-[#93C5FD]' : 'text-gray-600 dark:text-gray-400'}`}>
                  {doc.lastMsg}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="bg-gray-50 dark:bg-[#0F172A] border-t border-gray-200 dark:border-gray-700 rounded-bl-3xl px-4 py-4 shrink-0">
        <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-5">
          Start a new conversation with your doctor. Your messages are private and encrypted.
        </p>
      </footer>
    </aside>
  );
};

export default MessagesSidebar;
