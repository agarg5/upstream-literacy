import { Link } from 'react-router-dom';
import { MapPin, Users, Award } from 'lucide-react';
import { Member } from '../services/auth';
import MatchScore from './MatchScore';

interface Props {
  member: Member;
}

export default function MemberCard({ member }: Props) {
  return (
    <Link to={`/members/${member.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg">
            {member.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.title}</p>
          </div>
        </div>
        {member.match_score != null && <MatchScore score={member.match_score} />}
      </div>

      {member.district && (
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {member.district.name}, {member.district.state}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {member.district.enrollment.toLocaleString()} students
          </span>
          <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
            {member.district.type}
          </span>
        </div>
      )}

      {member.shared_problems && member.shared_problems.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Award size={12} className="text-accent-400" />
            Shared challenges
          </p>
          <div className="flex flex-wrap gap-1">
            {member.shared_problems.map(p => (
              <span key={p.id} className="text-xs bg-accent-50 text-accent-700 px-2 py-1 rounded-full">
                {p.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {member.problems && member.problems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {member.problems.filter(p => !member.shared_problems?.find(sp => sp.id === p.id)).map(p => (
            <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {p.title}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
