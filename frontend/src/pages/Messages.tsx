import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, ConversationSummary } from '../services/auth';
import api from '../services/api';
import { MessageSquare, Circle, ChevronRight } from 'lucide-react';

interface Props {
  user: User;
}

export default function Messages({ user }: Props) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/conversations');
      setConversations(res.data);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipants = (conv: ConversationSummary) => {
    return conv.participants.filter(p => p.id !== user.id);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <MessageSquare size={28} className="text-primary-600" />
          Messages
        </h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <MessageSquare size={28} className="text-primary-600" />
        Messages
      </h1>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageSquare size={40} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Find literacy leaders to connect with and start a conversation.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            Find Leaders
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {conversations.map(conv => {
            const others = getOtherParticipants(conv);
            const hasUnread = conv.unread_count > 0;

            return (
              <Link
                key={conv.id}
                to={`/conversations/${conv.id}`}
                className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors ${
                  hasUnread ? 'bg-primary-50/30' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg">
                    {others.length > 0 ? others[0].name.charAt(0) : '?'}
                  </div>
                  {hasUnread && (
                    <Circle
                      size={12}
                      className="absolute -top-0.5 -right-0.5 text-primary-600 fill-primary-600"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                      {others.map(p => p.name).join(', ') || 'Unknown'}
                    </h3>
                    {conv.last_message && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-3">
                        {formatTime(conv.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {conv.last_message
                        ? (conv.last_message.sender_id === user.id ? 'You: ' : '') +
                          truncateMessage(conv.last_message.body)
                        : 'No messages yet'}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {hasUnread && (
                        <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                  {others.length > 0 && others[0].title && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{others[0].title}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
