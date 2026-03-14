import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Member } from '../services/auth';
import api from '../services/api';
import MemberCard from '../components/MemberCard';
import { Sparkles, MapPin, BookOpen, Users, ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
}

export default function Dashboard({ user }: Props) {
  const [recommended, setRecommended] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommended();
  }, []);

  const fetchRecommended = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/members/recommended');
      setRecommended(res.data);
    } catch (err) {
      setError('Unable to load recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user.role === 'admin';
  const hasProfile = isAdmin || (user.district_id && user.problems && user.problems.length > 0);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.name}
        </h1>
        {user.district && (
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <MapPin size={16} />
            {user.title} at {user.district.name}, {user.district.state}
          </p>
        )}
      </div>

      {/* Profile completion prompt */}
      {!hasProfile && (
        <div className="bg-accent-50 border border-accent-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-accent-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Complete your profile to get matched</h3>
              <p className="text-gray-600 text-sm mb-4">
                Select your district and the literacy challenges you're working on so we can connect you
                with leaders facing similar situations.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-400 text-white rounded-lg hover:bg-accent-500 transition-colors font-medium text-sm"
              >
                Complete Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Your District</p>
              <p className="font-semibold text-gray-900">
                {user.district ? user.district.name : 'Not selected'}
              </p>
            </div>
          </div>
          {user.district && (
            <div className="flex gap-3 mt-3 text-xs text-gray-500">
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">{user.district.type}</span>
              <span>{user.district.enrollment.toLocaleString()} students</span>
              <span>{user.district.state}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Challenges You're Working On</p>
              <p className="font-semibold text-gray-900">
                {user.problems?.length || 0} selected
              </p>
            </div>
          </div>
          {user.problems && user.problems.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {user.problems.slice(0, 3).map(p => (
                <span key={p.id} className="text-xs bg-accent-50 text-accent-700 px-2 py-1 rounded-full">
                  {p.title}
                </span>
              ))}
              {user.problems.length > 3 && (
                <span className="text-xs text-gray-400">+{user.problems.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Recommended Matches</p>
              <p className="font-semibold text-gray-900">
                {recommended.length} leaders
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Based on your challenges and district profile
          </p>
        </div>
      </div>

      {/* Leaders Like You */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-accent-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Leaders Like You</h2>
              <p className="text-sm text-gray-500">
                AI-matched based on your challenges and district demographics
              </p>
            </div>
          </div>
          <Link
            to="/search"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : recommended.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Sparkles size={32} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No recommendations yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Complete your profile with your district and literacy challenges to get matched with similar leaders.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
