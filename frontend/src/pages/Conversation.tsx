import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Message } from '../services/auth';
import api from '../services/api';
import { ArrowLeft, Send } from 'lucide-react';

interface Props {
  user: User;
}

interface Participant {
  id: number;
  name: string;
  title: string;
  role: string;
}

export default function Conversation({ user }: Props) {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await api.get(`/api/conversations/${id}/messages`);
      const data = res.data;

      // Handle both response formats: { messages, participants } or just messages array
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages(data.messages || []);
        if (data.participants) setParticipants(data.participants);
      }
    } catch {
      // fail silently on polls
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [id]);

  const markAsRead = useCallback(async () => {
    try {
      await api.put(`/api/conversations/${id}/read`);
    } catch {
      // non-critical
    }
  }, [id]);

  useEffect(() => {
    fetchMessages(true);
    markAsRead();

    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(() => {
      fetchMessages(false);
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [id, fetchMessages, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = newMessage.trim();
    if (!body || sending) return;

    try {
      setSending(true);
      setNewMessage('');
      await api.post(`/api/conversations/${id}/messages`, { body });
      await fetchMessages(false);
    } catch {
      setNewMessage(body); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipants = () => {
    return participants.filter(p => p.id !== user.id);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const shouldShowDateSeparator = (msg: Message, prevMsg: Message | null) => {
    if (!prevMsg) return true;
    const current = new Date(msg.created_at).toDateString();
    const prev = new Date(prevMsg.created_at).toDateString();
    return current !== prev;
  };

  const others = getOtherParticipants();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 mb-4">
          <Link to="/messages" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="h-5 bg-gray-200 rounded w-40" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-md">
            <div className="h-10 bg-gray-100 rounded-xl w-2/3" />
            <div className="h-10 bg-gray-100 rounded-xl w-1/2 ml-auto" />
            <div className="h-10 bg-gray-100 rounded-xl w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200 mb-4 flex-shrink-0">
        <Link to="/messages" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          {others.length > 0 && (
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
              {others[0].name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">
              {others.map(p => p.name).join(', ') || 'Conversation'}
            </h2>
            {others.length > 0 && others[0].title && (
              <p className="text-xs text-gray-500">{others[0].title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-2 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === user.id;
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDate = shouldShowDateSeparator(msg, prevMsg);

            return (
              <div key={msg.id}>
                {/* Date separator */}
                {showDate && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                      {formatDate(msg.created_at)}
                    </div>
                  </div>
                )}

                {/* System message */}
                {msg.is_system ? (
                  <div className="flex justify-center my-3">
                    <div className="bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-lg max-w-md text-center italic">
                      {msg.body}
                    </div>
                  </div>
                ) : (
                  /* Regular message */
                  <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                      {/* Sender name for others */}
                      {!isOwn && (prevMsg?.sender_id !== msg.sender_id || showDate) && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender_name}</p>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="flex-shrink-0 pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm max-h-32"
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </form>
    </div>
  );
}
