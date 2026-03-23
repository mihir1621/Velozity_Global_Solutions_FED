import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ViewMode } from '../../types';
import { LayoutDashboard, List, CalendarDays, X, Plus } from 'lucide-react';
import { SIMULATED_ONLINE_USERS } from '../../utils/dataGenerator';
import { AvatarGroup, Avatar } from '../ui/Avatar';
import { AddTaskModal } from '../ui/AddTaskModal';

export const Header: React.FC = () => {
  const viewMode = useStore(state => state.viewMode);
  const setViewMode = useStore(state => state.setViewMode);
  const tasksCount = useStore(state => state.tasks.length);
  const [isOnlineOpen, setIsOnlineOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

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
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Collaboration Indicator */}
      <div className="relative">
        <button 
          onClick={() => setIsOnlineOpen(!isOnlineOpen)}
          className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 mr-1">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-semibold text-emerald-700 tracking-wide">
              {SIMULATED_ONLINE_USERS.map(u => u.name.split(' ')[0]).join(', ').replace(/, ([^,]*)$/, ' and $1')} are viewing
            </span>
          </div>
          
          <AvatarGroup users={SIMULATED_ONLINE_USERS} />
        </button>

        {isOnlineOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOnlineOpen(false)} />
            <div className="absolute right-0 top-14 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-scale-in origin-top-right">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active Listeners ({SIMULATED_ONLINE_USERS.length})
                </h3>
                <button onClick={() => setIsOnlineOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1">
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {SIMULATED_ONLINE_USERS.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar user={user} size="md" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Viewing Analytics Board</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {isAddOpen && <AddTaskModal onClose={() => setIsAddOpen(false)} />}
    </header>
  );
};
