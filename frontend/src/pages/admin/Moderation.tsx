import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { User } from '../../services/auth';
import { Shield, MessageSquare, UserPlus } from 'lucide-react';

interface Participant {
  id: number;
  name: string;
  title: string;
  role: string;
}

interface AdminConversation {
  id: number;
  participants: Participant[];
  message_count: number;
  last_message: {
    id: number;
    sender_id: number;
    sender_name: string;
    body: string;
    created_at: string;
  } | null;
  created_at: string;
}

interface Props {
  user: User;
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '...';
}

export default function Moderation({ user }: Props) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/api/admin/conversations');
        setConversations(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handleJoin = async (conversationId: number) => {
    setJoiningId(conversationId);
    try {
      await api.post(`/api/admin/conversations/${conversationId}/join`);
      navigate(`/conversations/${conversationId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to join conversation.');
      setJoiningId(null);
    }
  };

  const isParticipant = (conv: AdminConversation): boolean => {
    return conv.participants.some((p) => p.id === user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin h-8 w-8 text-[#1e3a5f]" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#1e3a5f]/10">
          <Shield className="h-5 w-5 text-[#1e3a5f]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
          <p className="text-sm text-gray-500">
            Monitor and join conversations across the platform
          </p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No conversations yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const alreadyJoined = isParticipant(conv);
            return (
              <div
                key={conv.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">
                        {conv.participants.map((p) => p.name).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{conv.message_count} {conv.message_count === 1 ? 'message' : 'messages'}</span>
                      <span className="text-gray-300">|</span>
                      <span>
                        Started {formatRelative(conv.created_at)}
                      </span>
                    </div>

                    {conv.last_message && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                          {conv.last_message.sender_name}:
                        </span>{' '}
                        {truncate(conv.last_message.body, 120)}
                        <span className="ml-2 text-xs text-gray-400">
                          {formatRelative(conv.last_message.created_at)}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {alreadyJoined ? (
                      <button
                        onClick={() => navigate(`/conversations/${conv.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                                   text-[#1e3a5f] bg-[#1e3a5f]/5 border border-[#1e3a5f]/20
                                   rounded-lg hover:bg-[#1e3a5f]/10 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        View
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(conv.id)}
                        disabled={joiningId === conv.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium
                                   text-white bg-[#1e3a5f] rounded-lg hover:bg-[#15304f]
                                   disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {joiningId === conv.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Joining...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Join Conversation
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
