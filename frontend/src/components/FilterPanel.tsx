import { SlidersHorizontal, X } from 'lucide-react';
import { Problem } from '../services/auth';

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
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  problems: Problem[];
  onSearch: () => void;
}

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function FilterPanel({ filters, onChange, problems, onSearch }: Props) {
  const update = (key: keyof Filters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleProblem = (id: number) => {
    const ids = filters.problem_ids.includes(id)
      ? filters.problem_ids.filter(x => x !== id)
      : [...filters.problem_ids, id];
    update('problem_ids', ids);
  };

  const clearFilters = () => {
    onChange({
      district_type: '', size_min: '', size_max: '',
      frl_min: '', frl_max: '', esl_min: '', esl_max: '',
      state: '', problem_ids: [],
    });
  };

  const hasFilters = filters.district_type || filters.size_min || filters.size_max ||
    filters.frl_min || filters.frl_max || filters.esl_min || filters.esl_max ||
    filters.state || filters.problem_ids.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={18} />
          Filters
        </h3>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* District Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">District Type</label>
        <select value={filters.district_type} onChange={e => update('district_type', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value="urban">Urban</option>
          <option value="suburban">Suburban</option>
          <option value="rural">Rural</option>
        </select>
      </div>

      {/* State */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <select value={filters.state} onChange={e => update('state', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All states</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* District Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">District Size (enrollment)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.size_min}
            onChange={e => update('size_min', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Max" value={filters.size_max}
            onChange={e => update('size_max', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* FRL Rate */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Free/Reduced Lunch Rate (%)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min %" value={filters.frl_min}
            onChange={e => update('frl_min', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Max %" value={filters.frl_max}
            onChange={e => update('frl_max', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* ESL Rate */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">ESL Population (%)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min %" value={filters.esl_min}
            onChange={e => update('esl_min', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Max %" value={filters.esl_max}
            onChange={e => update('esl_max', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Problem Statements */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Challenges</label>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {problems.map(p => (
            <label key={p.id} className="flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
              <input type="checkbox" checked={filters.problem_ids.includes(p.id)}
                onChange={() => toggleProblem(p.id)}
                className="mt-0.5 rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-700">{p.title}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={onSearch}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium">
        Search
      </button>
    </div>
  );
}
