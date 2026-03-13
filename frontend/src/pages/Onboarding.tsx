import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, District, Problem } from '../services/auth';
import {
  Search,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react';

interface Props {
  user: User;
  onComplete: () => void;
}

const STEPS = [
  { label: 'Your District', icon: Building2 },
  { label: 'Challenges', icon: GraduationCap },
  { label: 'Your Story', icon: FileText },
];

export default function Onboarding({ user, onComplete }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1 — District
  const [districtQuery, setDistrictQuery] = useState('');
  const [districtResults, setDistrictResults] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [searchingDistricts, setSearchingDistricts] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Step 2 — Problems
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);

  // Step 3 — Challenge text
  const [challengeText, setChallengeText] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch problems on mount
  useEffect(() => {
    api.get('/api/problems').then((res) => setProblems(res.data)).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // District search with debounce
  useEffect(() => {
    if (districtQuery.length < 2) {
      setDistrictResults([]);
      setShowDropdown(false);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearchingDistricts(true);
      try {
        const res = await api.get('/api/districts/search', {
          params: { query: districtQuery },
        });
        setDistrictResults(res.data);
        setShowDropdown(true);
      } catch {
        setDistrictResults([]);
      } finally {
        setSearchingDistricts(false);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [districtQuery]);

  const selectDistrict = (d: District) => {
    setSelectedDistrict(d);
    setDistrictQuery(d.name);
    setShowDropdown(false);
  };

  const toggleProblem = (id: number) => {
    setSelectedProblemIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await api.put('/api/profile', {
        district_id: selectedDistrict?.id ?? null,
        problem_ids: selectedProblemIds,
        challenge_text: challengeText.trim() || null,
      });
      onComplete();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!selectedDistrict;
    if (step === 1) return selectedProblemIds.length >= 1;
    return true;
  };

  const formatNumber = (n: number) => n.toLocaleString();
  const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p className="mt-1 text-sm text-blue-200">
            Let's set up your profile so we can connect you with the right peers.
          </p>
        </div>
      </div>

      {/* Progress steps */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isComplete = i < step;
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                        isComplete
                          ? 'bg-[#e8a838] border-[#e8a838] text-white'
                          : isActive
                          ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium hidden sm:inline ${
                        isActive ? 'text-[#1e3a5f]' : isComplete ? 'text-[#e8a838]' : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 rounded ${
                        i < step ? 'bg-[#e8a838]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 pb-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-8">
          {/* =================== Step 0: District =================== */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Find your school district
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Search by district name. We'll pull in public demographic data automatically.
              </p>

              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {searchingDistricts ? (
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={districtQuery}
                    onChange={(e) => {
                      setDistrictQuery(e.target.value);
                      if (selectedDistrict) setSelectedDistrict(null);
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20
                               focus:border-[#1e3a5f] text-sm transition-colors"
                    placeholder="Search districts (e.g. Denver Public Schools)..."
                  />
                </div>

                {showDropdown && districtResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {districtResults.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => selectDistrict(d)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100
                                   last:border-b-0 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {d.city}, {d.state}
                          <span className="text-gray-300">|</span>
                          {d.type}
                          <span className="text-gray-300">|</span>
                          {formatNumber(d.enrollment)} students
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && districtResults.length === 0 && districtQuery.length >= 2 && !searchingDistricts && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
                    No districts found. Try a different search term.
                  </div>
                )}
              </div>

              {/* Selected district details */}
              {selectedDistrict && (
                <div className="mt-6 rounded-lg border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-[#1e3a5f]" />
                    <h3 className="text-base font-semibold text-[#1e3a5f]">
                      {selectedDistrict.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <MapPin className="h-3 w-3" />
                        Location
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedDistrict.city}, {selectedDistrict.state}
                      </div>
                      <div className="text-xs text-gray-500 capitalize mt-0.5">
                        {selectedDistrict.type}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Users className="h-3 w-3" />
                        Enrollment
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(selectedDistrict.enrollment)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">students</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <GraduationCap className="h-3 w-3" />
                        Free/Reduced Lunch
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPct(selectedDistrict.free_reduced_lunch_pct)}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <GraduationCap className="h-3 w-3" />
                        ESL Population
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPct(selectedDistrict.esl_pct)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================== Step 1: Problems =================== */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                What challenges are you working on?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Select at least one. This helps us match you with leaders tackling similar issues.
              </p>

              <div className="space-y-2">
                {problems.map((p) => {
                  const isSelected = selectedProblemIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProblem(p.id)}
                      className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#1e3a5f] bg-[#1e3a5f]'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isSelected ? 'text-[#1e3a5f]' : 'text-gray-900'}`}>
                            {p.title}
                          </div>
                          {p.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{p.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedProblemIds.length > 0 && (
                <div className="mt-4 text-sm text-[#1e3a5f] font-medium">
                  {selectedProblemIds.length} challenge{selectedProblemIds.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}

          {/* =================== Step 2: Free text =================== */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Tell us more (optional)
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Describe your biggest literacy challenge in your own words. Our AI uses this to find
                leaders with deeply similar experiences, even when they use different terminology.
              </p>

              <textarea
                value={challengeText}
                onChange={(e) => setChallengeText(e.target.value)}
                rows={5}
                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20
                           focus:border-[#1e3a5f] text-sm transition-colors resize-none"
                placeholder="Describe your biggest literacy challenge..."
              />
              <div className="mt-2 text-xs text-gray-400">
                {challengeText.length > 0
                  ? `${challengeText.length} characters`
                  : 'This is optional but improves your match quality.'}
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-medium text-white
                           bg-[#1e3a5f] hover:bg-[#15304f] disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white
                           bg-[#e8a838] hover:bg-[#d4962e] disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
