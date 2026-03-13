import { useState, useEffect, useCallback } from 'react';
import { User, Member, Problem } from '../services/auth';
import api from '../services/api';
import MemberCard from '../components/MemberCard';
import FilterPanel from '../components/FilterPanel';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';

interface Props {
  user: User;
}

interface Filters {
  district_type: string;
  size_min: string;
  size_max: string;
  frl_min: string;
  frl_max: string;
  esl_min: string;
  esl_max: string;
  state: string;
  problem_ids: number[];
  sort_by: string;
}

const defaultFilters: Filters = {
  district_type: '',
  size_min: '',
  size_max: '',
  frl_min: '',
  frl_max: '',
  esl_min: '',
  esl_max: '',
  state: '',
  problem_ids: [],
  sort_by: 'best_match',
};

export default function Search({ user }: Props) {
  const [results, setResults] = useState<Member[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProblems();
    doSearch();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await api.get('/api/problems');
      setProblems(res.data);
    } catch {
      // fail silently
    }
  };

  const buildParams = useCallback((f: Filters) => {
    const params: Record<string, string> = {};
    if (f.district_type) params.district_type = f.district_type;
    if (f.size_min) params.size_min = f.size_min;
    if (f.size_max) params.size_max = f.size_max;
    if (f.frl_min) params.frl_min = String(Number(f.frl_min) / 100);
    if (f.frl_max) params.frl_max = String(Number(f.frl_max) / 100);
    if (f.esl_min) params.esl_min = String(Number(f.esl_min) / 100);
    if (f.esl_max) params.esl_max = String(Number(f.esl_max) / 100);
    if (f.state) params.state = f.state;
    if (f.sort_by) params.sort_by = f.sort_by;
    if (f.problem_ids.length > 0) {
      params.problem_ids = f.problem_ids.join(',');
    }
    return params;
  }, []);

  const doSearch = async (overrideFilters?: Filters) => {
    const f = overrideFilters || filters;
    try {
      setLoading(true);
      const params = buildParams(f);
      const res = await api.get('/api/members/search', { params });
      setResults(res.data.results || res.data);
      setTotalCount(res.data.total ?? (res.data.results || res.data).length);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
  };

  const handleSearch = () => {
    doSearch();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    doSearch(defaultFilters);
  };

  const activeFilterCount = [
    filters.district_type,
    filters.size_min,
    filters.size_max,
    filters.frl_min,
    filters.frl_max,
    filters.esl_min,
    filters.esl_max,
    filters.state,
  ].filter(Boolean).length + (filters.problem_ids.length > 0 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SearchIcon size={28} className="text-primary-600" />
          Find Literacy Leaders
        </h1>
        <p className="text-gray-500 mt-1">
          Search and filter to discover leaders facing similar challenges
        </p>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel
                filters={filters}
                problems={problems}
                onChange={handleFilterChange}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          <SlidersHorizontal size={20} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-400 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Mobile filter drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                problems={problems}
                onChange={handleFilterChange}
                onSearch={() => { handleSearch(); setMobileFiltersOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3">
            <p className="text-sm text-gray-600">
              {loading ? 'Searching...' : (
                <>
                  <span className="font-semibold text-gray-900">{totalCount}</span> leader{totalCount !== 1 ? 's' : ''} found
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Sort by:</label>
              <select
                value={filters.sort_by}
                onChange={e => {
                  const updated = { ...filters, sort_by: e.target.value };
                  setFilters(updated);
                  doSearch(updated);
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="best_match">Best Match</option>
                <option value="recently_active">Recently Active</option>
              </select>
            </div>
          </div>

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
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
          ) : results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <SearchIcon size={40} className="text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">No leaders found</h3>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your filters or broadening your search criteria.
              </p>
              <button
                onClick={handleReset}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
