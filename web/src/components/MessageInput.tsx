import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { ConnectionStatus } from '../types/chat';

type MessageInputProps = {
  onSend: (message: string) => Promise<void> | void;
  onTypingChange: (isTyping: boolean) => void;
  connectionStatus: ConnectionStatus;
};

const MessageInput = ({ onSend, onTypingChange, connectionStatus }: MessageInputProps) => {
  const [value, setValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const resetTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingChange(false);
      }
    }, 2000);
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const handleTypingChange = (nextValue: string) => {
    const trimmed = nextValue.trim();

    if (trimmed && !isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    }

    if (!trimmed && isTyping) {
      setIsTyping(false);
      onTypingChange(false);
    }

    if (trimmed) {
      resetTypingTimeout();
    } else if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const submitMessage = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setValue('');

    if (isTyping) {
      setIsTyping(false);
      onTypingChange(false);
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  };

  const isDisabled = connectionStatus !== 'connected';

  return (
    <form
      className="flex items-end gap-3 rounded-2xl bg-slate-900/90 p-4 ring-1 ring-slate-800"
      onSubmit={handleSubmit}
    >
      <textarea
        className="h-12 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        disabled={isDisabled}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          handleTypingChange(next);
        }}
        onFocus={() => {
          if (value.trim()) {
            handleTypingChange(value);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled ? 'Conectando ao chat...' : 'Digite uma mensagem'}
        ref={textareaRef}
        rows={1}
        value={value}
      />
      <button
        className="shrink-0 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-700"
        disabled={isDisabled || !value.trim()}
        type="submit"
      >
        Enviar
      </button>
    </form>
  );
};

export default MessageInput;
