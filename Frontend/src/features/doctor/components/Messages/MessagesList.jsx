const MessagesList = ({ messages, doctorImg, doctorName, bottomRef }) => {
  return (
    <section className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4" aria-label="Conversation">
      {messages.map((msg) => {
        const isMe = msg.from === 'me';
        return (
          <article key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && (
              <div className="flex items-start gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
                <img
                  src={doctorImg}
                  alt={doctorName ? `Avatar of ${doctorName}` : 'Doctor avatar'}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div>
                  <div className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-tl-sm rounded-tr-3xl rounded-bl-3xl rounded-br-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-4 py-4">
                    {msg.type === 'text'
                      ? <p className="text-[14px] text-black-main-text dark:text-[#E2E8F0] font-normal leading-5">{msg.text}</p>
                      : <img src={msg.text} alt="Attached image" className="max-w-[200px] rounded-lg" />
                    }
                  </div>
                  <span className="text-[14px] text-[var(--msg-muted)] mt-1 ml-1 block">{msg.time}</span>
                </div>
              </div>
            )}

            {isMe && (
              <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
                <div className="bg-[#333CF5] rounded-tl-3xl rounded-tr-sm rounded-bl-3xl rounded-br-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] px-4 py-4">
                  {msg.type === 'text'
                    ? <p className="text-[14px] text-white font-normal leading-5">{msg.text}</p>
                    : <img src={msg.text} alt="Your attachment" className="max-w-[200px] rounded-lg" />
                  }
                </div>
                <span className="text-[12px] text-[var(--msg-muted)] mt-1 mr-1">{msg.time}</span>
              </div>
            )}
          </article>
        );
      })}
      <div ref={bottomRef} />
    </section>
  );
};

export default MessagesList;
