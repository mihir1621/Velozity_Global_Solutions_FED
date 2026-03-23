import React from 'react';
import { useStore } from '../../store/useStore';
import { ViewMode } from '../../types';
import { LayoutDashboard, List, CalendarDays } from 'lucide-react';
import { SIMULATED_ONLINE_USERS } from '../../utils/dataGenerator';
import { AvatarGroup } from '../ui/Avatar';

export const Header: React.FC = () => {
  const viewMode = useStore(state => state.viewMode);
  const setViewMode = useStore(state => state.setViewMode);
  const tasksCount = useStore(state => state.tasks.length);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Project Alpha Analytics</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Tracking {tasksCount} tasks total</p>
        </div>
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        
        {/* View Toggles */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          {(['Kanban', 'List', 'Timeline'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === mode ? 'bg-white text-blue-700 shadow-sm shadow-black/5 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
            >
              {mode === 'Kanban' && <LayoutDashboard size={16} />}
              {mode === 'List' && <List size={16} />}
              {mode === 'Timeline' && <CalendarDays size={16} />}
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Collaboration Indicator */}
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-105">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mr-2">Online</span>
        </div>
        
        <AvatarGroup users={SIMULATED_ONLINE_USERS} />
      </div>
    </header>
  );
};
