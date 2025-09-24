export type Message = {
  user: string;
  message: string;
  timestamp: string;
};

export type TypingEvent = {
  user: string;
  isTyping: boolean;
};

export type UsersOnlineSummary = {
  count: number;
  users: string[];
};

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
