import { useEffect, useRef } from 'react';

import type { Message } from '../types/chat';
import { formatTimestamp } from '../utils/time';

type MessageListProps = {
  messages: Message[];
  currentUser: string;
};

const MessageList = ({ messages, currentUser }: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex-1 overflow-y-auto space-y-4 rounded-2xl bg-slate-900/60 p-6 ring-1 ring-slate-800"
      ref={containerRef}
    >
      {messages.length === 0 ? (
        <p className="text-center text-sm text-slate-400">Nenhuma mensagem ainda. Diga oi!</p>
      ) : (
        messages.map((message, index) => {
          const isCurrentUser = message.user === currentUser;
          return (
            <div className="flex flex-col" key={`${message.timestamp}-${index}`}>
              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-lg shadow-slate-950/30 ${isCurrentUser ? 'bg-sky-500 text-white' : 'bg-slate-800/80 text-slate-100 ring-1 ring-slate-700'}`}
                >
                  <div className="flex items-center justify-between gap-6">
                    <span className={isCurrentUser ? 'font-semibold text-white' : 'font-semibold text-sky-300'}>
                      {isCurrentUser ? 'Voce' : message.user}
                    </span>
                    <span className={`text-xs ${isCurrentUser ? 'text-sky-100/80' : 'text-slate-400'}`}>
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageList;
