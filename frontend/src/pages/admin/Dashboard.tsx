import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, MessageSquare, Activity, BarChart3 } from 'lucide-react';

interface Stats {
  total_users: number;
  total_conversations: number;
  total_messages: number;
  active_users_7d: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load admin stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = stats
    ? [
        {
          label: 'Total Users',
          value: stats.total_users,
          icon: Users,
          color: 'bg-blue-50 text-[#1e3a5f]',
          iconBg: 'bg-[#1e3a5f]/10',
        },
        {
          label: 'Total Conversations',
          value: stats.total_conversations,
          icon: MessageSquare,
          color: 'bg-amber-50 text-[#e8a838]',
          iconBg: 'bg-[#e8a838]/10',
        },
        {
          label: 'Total Messages',
          value: stats.total_messages,
          icon: BarChart3,
          color: 'bg-green-50 text-green-700',
          iconBg: 'bg-green-100',
        },
        {
          label: 'Active Users (7 days)',
          value: stats.active_users_7d,
          icon: Activity,
          color: 'bg-purple-50 text-purple-700',
          iconBg: 'bg-purple-100',
        },
      ]
    : [];

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center h-12 w-12 rounded-lg ${card.iconBg}`}>
                <card.icon className={`h-6 w-6 ${card.color.split(' ')[1]}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
