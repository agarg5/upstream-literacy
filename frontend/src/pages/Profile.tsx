import { User } from '../services/auth';
import { MapPin, Users, BookOpen, Building, GraduationCap, DollarSign, Globe, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  user: User;
}

export default function Profile({ user }: Props) {
  const district = user.district;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 text-lg">{user.title}</p>
              {district && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {district.name}, {district.state}
                  </span>
                  <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                    {district.type}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex-shrink-0"
          >
            <Edit3 size={18} />
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: district demographics */}
        <div className="lg:col-span-1 space-y-6">
          {district && (
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
                    {district.enrollment.toLocaleString()} students
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {district.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Free/Reduced Lunch</p>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          {(district.free_reduced_lunch_pct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-400 rounded-full"
                          style={{ width: `${district.free_reduced_lunch_pct * 100}%` }}
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
                          {(district.esl_pct * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-400 rounded-full"
                          style={{ width: `${district.esl_pct * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: challenge text and problems */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenge description */}
          {user.challenge_text && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap size={18} className="text-primary-600" />
                Your Biggest Challenge
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {user.challenge_text}
              </p>
            </div>
          )}

          {/* All problems */}
          {user.problems && user.problems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={18} className="text-primary-600" />
                Literacy Challenges
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.problems.map(p => (
                  <span
                    key={p.id}
                    className="text-sm px-3 py-1.5 rounded-full border bg-accent-50 text-accent-700 border-accent-200"
                  >
                    {p.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No profile data */}
          {!district && (!user.problems || user.problems.length === 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <GraduationCap size={32} className="text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 mb-1">Profile not complete</h3>
              <p className="text-gray-500 text-sm mb-4">
                Add your district and literacy challenges to get matched with similar leaders.
              </p>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
              >
                Complete Profile
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
