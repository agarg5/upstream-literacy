import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Member } from '../services/auth';
import api from '../services/api';
import MatchScore from '../components/MatchScore';
import { ArrowLeft, MessageSquare, MapPin, Users, BookOpen, CheckCircle, Building, GraduationCap, Globe, DollarSign } from 'lucide-react';

interface Props {
  user: User;
}

export default function MemberProfile({ user }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/members/${id}`);
      setMember(res.data);
    } catch {
      setError('Unable to load this member profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!member) return;
    try {
      setSendingMessage(true);
      const res = await api.post('/api/conversations', { recipient_id: member.id });
      navigate(`/conversations/${res.data.id}`);
    } catch {
      setError('Unable to start a conversation. Please try again.');
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-8" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/search" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft size={18} />
          Back to search
        </Link>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!member) return null;

  const commonalities = member.commonalities;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl flex-shrink-0">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-500 text-lg">{member.title}</p>
              {member.district && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {member.district.name}, {member.district.state}
                  </span>
                  <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                    {member.district.type}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {member.match_score != null && (
              <MatchScore score={member.match_score} size="lg" />
            )}
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare size={18} />
              {sendingMessage ? 'Starting...' : 'Send Message'}
            </button>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: district demographics */}
        <div className="lg:col-span-1 space-y-6">
          {member.district && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building size={18} className="text-primary-600" />
                District Demographics
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Enrollment</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    {member.district.enrollment.toLocaleString()} students
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {member.district.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Free/Reduced Lunch</p>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {(member.district.free_reduced_lunch_pct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full"
                          style={{ width: `${member.district.free_reduced_lunch_pct * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">ESL Population</p>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {(member.district.esl_pct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-400 rounded-full"
                          style={{ width: `${member.district.esl_pct * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: commonalities, problems, challenge */}
        <div className="lg:col-span-2 space-y-6">
          {/* What you have in common */}
          {commonalities && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                What You Have in Common
              </h2>
              <div className="space-y-3">
                {commonalities.shared_problems.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      You both face these challenges:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {commonalities.shared_problems.map(p => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1.5 text-sm bg-accent-50 text-accent-700 px-3 py-1.5 rounded-full border border-accent-200"
                        >
                          <BookOpen size={14} />
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {commonalities.same_district_type && (
                    <span className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      Same district type
                    </span>
                  )}
                  {commonalities.similar_size && (
                    <span className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      Similar district size
                    </span>
                  )}
                  {commonalities.similar_frl && (
                    <span className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      Similar FRL rate
                    </span>
                  )}
                  {commonalities.similar_esl && (
                    <span className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                      Similar ESL population
                    </span>
                  )}
                </div>
                {commonalities.shared_problems.length === 0 &&
                  !commonalities.same_district_type &&
                  !commonalities.similar_size &&
                  !commonalities.similar_frl &&
                  !commonalities.similar_esl && (
                    <p className="text-sm text-gray-500">
                      No strong commonalities yet. You may still find valuable insights from this leader's experience.
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Challenge description */}
          {member.challenge_text && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap size={18} className="text-primary-600" />
                Their Biggest Challenge
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {member.challenge_text}
              </p>
            </div>
          )}

          {/* All problems */}
          {member.problems && member.problems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-primary-600" />
                Literacy Challenges
              </h2>
              <div className="flex flex-wrap gap-2">
                {member.problems.map(p => {
                  const isShared = commonalities?.shared_problems.some(sp => sp.id === p.id);
                  return (
                    <span
                      key={p.id}
                      className={`text-sm px-3 py-1.5 rounded-full border ${
                        isShared
                          ? 'bg-accent-50 text-accent-700 border-accent-200 font-medium'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {p.title}
                      {isShared && <span className="ml-1 text-xs">(shared)</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
