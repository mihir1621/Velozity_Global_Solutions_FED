import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useSearchParams } from 'react-router-dom';
import { TaskStatus, TaskPriority } from '../../types';
import { X, Search, ChevronDown } from 'lucide-react';

const MULTI_SELECT_OPTIONS = {
  status: ['To Do', 'In Progress', 'In Review', 'Done'] as TaskStatus[],
  priority: ['Critical', 'High', 'Medium', 'Low'] as TaskPriority[],
};

export const FilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useStore(state => state.filters);
  const setFilters = useStore(state => state.setFilters);
  const clearFiltersStore = useStore(state => state.clearFilters);
  
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | null>(null);

  // Sync back from URL on load/popstate
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    
    setFilters({
      status: statusParam ? (statusParam.split(',') as TaskStatus[]) : [],
      priority: priorityParam ? (priorityParam.split(',') as TaskPriority[]) : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync to URL instantly whenever filters change in store
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    } else {
      params.delete('status');
    }
    
    if (filters.priority.length > 0) {
      params.set('priority', filters.priority.join(','));
    } else {
      params.delete('priority');
    }
    
    setSearchParams(params, { replace: true });
  }, [filters, searchParams, setSearchParams]);

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0;

  const toggleFilter = (type: 'status' | 'priority', value: string) => {
    const current = filters[type];
    const updated = current.includes(value as never)
      ? current.filter(v => v !== value)
      : [...current, value];
      
    setFilters({ [type]: updated as any });
  };

  const clearAll = () => {
    clearFiltersStore();
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors w-64"
            disabled
            title="Search is visual only for this demo"
          />
        </div>

        {/* Filter Badges / Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Status Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${filters.status.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Status {filters.status.length > 0 && <span className="bg-blue-100 px-1.5 py-0.5 rounded-md text-xs">{filters.status.length}</span>}
              <ChevronDown size={14} className={filters.status.length > 0 ? 'text-blue-500' : 'text-gray-400'} />
            </button>
            {activeDropdown === 'status' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                <div className="absolute top-12 left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {MULTI_SELECT_OPTIONS.status.map(s => (
                    <label key={s} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={filters.status.includes(s)} 
                        onChange={() => toggleFilter('status', s)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${filters.priority.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Priority {filters.priority.length > 0 && <span className="bg-blue-100 px-1.5 py-0.5 rounded-md text-xs">{filters.priority.length}</span>}
              <ChevronDown size={14} className={filters.priority.length > 0 ? 'text-blue-500' : 'text-gray-400'} />
            </button>
            {activeDropdown === 'priority' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                <div className="absolute top-12 left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {MULTI_SELECT_OPTIONS.priority.map(p => (
                    <label key={p} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={filters.priority.includes(p)} 
                        onChange={() => toggleFilter('priority', p)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{p}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Clear Filters CTA */}
      {hasActiveFilters && (
        <button 
          onClick={clearAll}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors animate-in fade-in"
        >
          <X size={14} />
          Clear Filters
        </button>
      )}
    </div>
  );
};
