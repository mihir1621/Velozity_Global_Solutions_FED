import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useSearchParams } from 'react-router-dom';
import { TaskStatus, TaskPriority } from '../../types';
import { X, Search, ChevronDown, Calendar } from 'lucide-react';
import { MOCK_USERS } from '../../utils/dataGenerator';

const MULTI_SELECT_OPTIONS = {
  status: ['To Do', 'In Progress', 'In Review', 'Done'] as TaskStatus[],
  priority: ['Critical', 'High', 'Medium', 'Low'] as TaskPriority[],
};

export const FilterBar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useStore(state => state.filters);
  const setFilters = useStore(state => state.setFilters);
  const clearFiltersStore = useStore(state => state.clearFilters);
  
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | 'assignees' | 'date' | null>(null);

  // Sync back from URL on load/popstate
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const assigneesParam = searchParams.get('assignees');
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const searchParam = searchParams.get('q');
    
    setFilters({
      status: statusParam ? (statusParam.split(',') as TaskStatus[]) : [],
      priority: priorityParam ? (priorityParam.split(',') as TaskPriority[]) : [],
      assignees: assigneesParam ? assigneesParam.split(',') : [],
      dueDateRange: {
        start: startParam || null,
        end: endParam || null,
      },
      search: searchParam || ''
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
    
    if (filters.assignees.length > 0) {
      params.set('assignees', filters.assignees.join(','));
    } else {
      params.delete('assignees');
    }
    
    if (filters.dueDateRange.start) {
      params.set('start', filters.dueDateRange.start);
    } else params.delete('start');
    
    if (filters.dueDateRange.end) {
      params.set('end', filters.dueDateRange.end);
    } else params.delete('end');
    
    if (filters.search) {
      params.set('q', filters.search);
    } else params.delete('q');
    
    setSearchParams(params, { replace: true });
  }, [filters, searchParams, setSearchParams]);

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || filters.assignees.length > 0 || filters.dueDateRange.start || filters.dueDateRange.end || filters.search;

  const toggleFilter = (type: 'status' | 'priority', value: string) => {
    const current = filters[type];
    const updated = current.includes(value as never)
      ? current.filter(v => v !== value)
      : [...current, value];
      
    setFilters({ [type]: updated as any });
  };
  
  const toggleAssignee = (id: string) => {
    const current = filters.assignees;
    const updated = current.includes(id) ? current.filter(v => v !== id) : [...current, id];
    setFilters({ assignees: updated });
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
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search tasks..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors w-64"
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
                <div className="absolute top-12 left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-2 overflow-hidden animate-scale-in origin-top">
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
                <div className="absolute top-12 left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-2 overflow-hidden animate-scale-in origin-top">
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

          {/* Assignees Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'assignees' ? null : 'assignees')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${filters.assignees.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Assignee {filters.assignees.length > 0 && <span className="bg-blue-100 px-1.5 py-0.5 rounded-md text-xs">{filters.assignees.length}</span>}
              <ChevronDown size={14} className={filters.assignees.length > 0 ? 'text-blue-500' : 'text-gray-400'} />
            </button>
            {activeDropdown === 'assignees' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                <div className="absolute top-12 left-0 w-56 bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-2 overflow-hidden animate-scale-in origin-top max-h-64 overflow-y-auto">
                  {MOCK_USERS.map(user => (
                    <label key={user.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={filters.assignees.includes(user.id)} 
                        onChange={() => toggleAssignee(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 truncate">{user.name}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Date Picker Tool */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${(filters.dueDateRange.start || filters.dueDateRange.end) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Calendar size={14} /> Date
              <ChevronDown size={14} className={(filters.dueDateRange.start || filters.dueDateRange.end) ? 'text-blue-500' : 'text-gray-400'} />
            </button>
            {activeDropdown === 'date' && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                <div className="absolute top-12 left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-4 space-y-3 animate-scale-in origin-top">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
                    <input 
                      type="date"
                      value={filters.dueDateRange.start ? filters.dueDateRange.start.split('T')[0] : ''}
                      onChange={(e) => setFilters({ dueDateRange: { ...filters.dueDateRange, start: e.target.value ? new Date(e.target.value).toISOString() : null } })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
                    <input 
                      type="date"
                      value={filters.dueDateRange.end ? filters.dueDateRange.end.split('T')[0] : ''}
                      onChange={(e) => setFilters({ dueDateRange: { ...filters.dueDateRange, end: e.target.value ? new Date(e.target.value).toISOString() : null } })}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
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
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors animate-fade-in"
        >
          <X size={14} />
          Clear Filters
        </button>
      )}
    </div>
  );
};
