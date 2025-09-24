import { useEffect, useMemo, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';

import MessageInput from '../components/MessageInput';
import MessageList from '../components/MessageList';
import OnlineBadge from '../components/OnlineBadge';
import TypingIndicator from '../components/TypingIndicator';
import type { ConnectionStatus, Message } from '../types/chat';

const STORAGE_KEY = 'chat-nickname';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5185';
const HUB_URL = `${API_BASE_URL.replace(/\/$/, '')}/hubs/chat`;
const MAX_MESSAGES = 50;

const connectionStatusLabel: Record<ConnectionStatus, string> = {
  connected: 'Conectado',
  connecting: 'Conectando',
  disconnected: 'Desconectado',
  reconnecting: 'Reconectando',
};

const isSameMessage = (a: Message, b: Message) =>
  a.timestamp === b.timestamp && a.user === b.user && a.message === b.message;

const appendUniqueMessage = (current: Message[], incoming: Message) => {
  if (current.some((message) => isSameMessage(message, incoming))) {
    return current;
  }

  const next = [...current, incoming];
  if (next.length > MAX_MESSAGES) {
    return next.slice(next.length - MAX_MESSAGES);
  }
  return next;
};

const normalizeHistory = (history: Message[]): Message[] => {
  const unique: Message[] = [];
  history.forEach((message) => {
    if (!unique.some((existing) => isSameMessage(existing, message))) {
      unique.push(message);
    }
  });

  return unique.slice(-MAX_MESSAGES);
};

const ChatPage = () => {
  const navigate = useNavigate();
  const nickname = useMemo(() => localStorage.getItem(STORAGE_KEY)?.trim() ?? '', []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);
  const typingTimeoutsRef = useRef<Record<string, number>>({});
  const typingStateRef = useRef(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!nickname) {
      navigate('/login', { replace: true });
    }
  }, [navigate, nickname]);

  useEffect(() => {
    let isCancelled = false;

    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = (await response.json()) as Message[];
        if (!isCancelled) {
          setMessages(normalizeHistory(data));
        }
      } catch (error) {
        console.error('Failed to load history', error);
      }
    };

    if (nickname) {
      void loadHistory();
    }

    return () => {
      isCancelled = true;
    };
  }, [nickname]);

  useEffect(() => {
    if (!nickname) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${HUB_URL}?user=${encodeURIComponent(nickname)}`)
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const addTypingUser = (user: string) => {
      setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
      if (typingTimeoutsRef.current[user]) {
        window.clearTimeout(typingTimeoutsRef.current[user]);
      }
      typingTimeoutsRef.current[user] = window.setTimeout(() => {
        setTypingUsers((prev) => prev.filter((name) => name !== user));
        delete typingTimeoutsRef.current[user];
      }, 3000);
    };

    const removeTypingUser = (user: string) => {
      setTypingUsers((prev) => prev.filter((name) => name !== user));
      if (typingTimeoutsRef.current[user]) {
        window.clearTimeout(typingTimeoutsRef.current[user]);
        delete typingTimeoutsRef.current[user];
      }
    };

    connection.on('ReceiveMessage', (user: string, content: string, timestamp: string) => {
      setMessages((prev) => appendUniqueMessage(prev, { user, message: content, timestamp }));
      removeTypingUser(user);
    });

    connection.on('UserStartedTyping', (user: string) => {
      if (user !== nickname) {
        addTypingUser(user);
      }
    });

    connection.on('UserStoppedTyping', (user: string) => {
      removeTypingUser(user);
    });

    connection.on('UsersOnlineChanged', (payload: { count?: number; users?: string[] }) => {
      const users = Array.isArray(payload?.users) ? payload.users : [];
      setOnlineUsers(users);
    });

    connection.onreconnecting(() => {
      setConnectionStatus('reconnecting');
    });

    connection.onreconnected(() => {
      setConnectionStatus('connected');
      typingStateRef.current = false;
    });

    connection.onclose(() => {
      setConnectionStatus('disconnected');
      typingStateRef.current = false;
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = window.setTimeout(() => {
        void startConnection();
      }, 3000);
    });

    const startConnection = async () => {
      setConnectionStatus('connecting');
      try {
        await connection.start();
        setConnectionStatus('connected');
        typingStateRef.current = false;
      } catch (error) {
        console.error('Failed to connect to SignalR hub', error);
        setConnectionStatus('disconnected');
        reconnectTimeoutRef.current = window.setTimeout(() => {
          void startConnection();
        }, 3000);
      }
    };

    void startConnection();

    return () => {
      Object.values(typingTimeoutsRef.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      typingTimeoutsRef.current = {};
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      connection.stop().catch((error) => {
        console.error('Failed to stop connection', error);
      });
      connectionRef.current = null;
    };
  }, [nickname]);

  const sendTypingState = async (isTyping: boolean) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected || typingStateRef.current === isTyping) {
      return;
    }

    typingStateRef.current = isTyping;
    const method = isTyping ? 'StartTyping' : 'StopTyping';
    try {
      await connection.invoke(method, nickname);
    } catch (error) {
      console.error('Failed to notify typing state', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected) {
      return;
    }
    try {
      await connection.invoke('SendMessage', nickname, text);
    } catch (error) {
      console.error('Failed to send message', error);
    }
    typingStateRef.current = false;
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  if (!nickname) {
    return null;
  }

  return (
    <main className="flex min-h-screen justify-center bg-slate-950 px-4 py-8">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-2xl bg-slate-900/80 p-6 ring-1 ring-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Chat Maneiro</h1>
            <p className="text-sm text-slate-400">Converse em tempo real com a galera.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-semibold text-slate-400">
              Status: {connectionStatusLabel[connectionStatus]}
            </span>
            <OnlineBadge users={onlineUsers} />
          </div>
        </header>

        <section className="flex flex-1 flex-col gap-4 rounded-2xl bg-slate-950/60 p-4">
          <MessageList currentUser={nickname} messages={messages} />
          <TypingIndicator currentUser={nickname} users={typingUsers} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Logado como {nickname}</span>
            <button
              className="rounded-full border border-slate-700 px-4 py-1 text-xs font-semibold text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
              onClick={handleClearMessages}
              type="button"
            >
              Limpar chat (local)
            </button>
          </div>
          <MessageInput
            connectionStatus={connectionStatus}
            onSend={handleSendMessage}
            onTypingChange={sendTypingState}
          />
        </section>
      </div>
    </main>
  );
};

export default ChatPage;
