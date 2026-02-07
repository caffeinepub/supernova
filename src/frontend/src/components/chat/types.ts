export type MessageMode = 'chat' | 'web-search';

export type PhotoAttachment = {
  url: string; // Local object URL for preview or direct URL from backend
  filename?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string; excerpt: string }>;
  timestamp: Date;
  mode?: MessageMode;
  photos?: PhotoAttachment[];
};
