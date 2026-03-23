import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Task } from '../../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { AvatarGroup } from '../ui/Avatar';

export const TimelineView: React.FC = () => {
  const getFilteredSortedTasks = useStore(state => state.getFilteredSortedTasks);
  const rawTasks = useStore(state => state.tasks);
  const filters = useStore(state => state.filters);
  const sort = useStore(state => state.sort);
  
  const tasks = React.useMemo(() => getFilteredSortedTasks(), [
    getFilteredSortedTasks, rawTasks, filters, sort
  ]);
  
  // Timeline: Current Month
  const days = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

  const getPriorityColor = (priority: Task['priority']) => {
    switch(priority) {
      case 'Critical': return 'bg-red-500 border-red-600 shadow-red-500/30';
      case 'High': return 'bg-orange-500 border-orange-600 shadow-orange-500/30';
      case 'Medium': return 'bg-blue-500 border-blue-600 shadow-blue-500/30';
      case 'Low': return 'bg-green-500 border-green-600 shadow-green-500/30';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  const getBarLayout = (task: Task) => {
    // Determine start index (0-indexed)
    const start = task.startDate ? new Date(task.startDate) : new Date(task.dueDate);
    const due = new Date(task.dueDate);
    
    // Check if start/due are within timeline scope
    const dayStartIdx = days.findIndex(d => isSameDay(d, start) || d > start);
    const startIdx = dayStartIdx === -1 ? 0 : dayStartIdx;
    
    const dayEndIdx = days.findIndex(d => isSameDay(d, due) || d > due);
    const endIdx = dayEndIdx === -1 ? days.length - 1 : dayEndIdx;
    
    const duration = Math.max(1, endIdx - startIdx + 1);
    
    return {
      left: `${startIdx * 64}px`, // 64px per day width
      width: `${duration * 64}px`,
      isSingleDay: !task.startDate
    };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative animate-slide-up">
      
      {/* Unified Scroll Container */}
      <div className="flex-1 overflow-auto relative">
      
        {/* Header Grid: Days */}
        <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-30 w-max min-w-full">
          <div className="w-64 min-w-[256px] border-r border-gray-200 bg-gray-50 flex items-center px-4 font-semibold text-gray-700 sticky left-0 z-40 shadow-[2px_0_5px_rgba(0,0,0,0.05)] text-sm">
          Task
        </div>
        <div className="flex">
          {days.map(day => (
            <div 
              key={day.toISOString()} 
              className={`w-16 min-w-16 flex flex-col items-center justify-center py-2 border-r border-gray-200 ${isToday(day) ? 'bg-blue-50' : ''}`}
            >
              <span className="text-xs font-medium text-gray-500">{format(day, 'EEE')}</span>
              <span className={`text-sm font-bold ${isToday(day) ? 'text-blue-600' : 'text-gray-800'}`}>
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Tasks Container */}
      <div className="relative w-max min-w-full">
        {/* Today Marker Line */}
        {days.findIndex(d => isToday(d)) !== -1 && (
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-blue-500/50 z-10 pointer-events-none"
            style={{ 
              left: `${256 + (days.findIndex(d => isToday(d)) * 64) + 32}px` // 256 for sidebar width + day offset + half cell offset
            }}
          />
        )}

        {tasks.map((task, idx) => {
          const layout = getBarLayout(task);
          
          return (
            <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50 group">
              {/* Task Title (Sticky Left) */}
              <div className="w-64 min-w-[256px] border-r border-gray-200 bg-white group-hover:bg-gray-50 flex items-center justify-between px-4 py-3 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] transition-colors text-sm">
                <span className="font-medium text-gray-800 truncate pr-2" title={task.title}>{task.title}</span>
                {task.viewingUsers && task.viewingUsers.length > 0 && <AvatarGroup users={task.viewingUsers} maxCount={1} />}
              </div>
              
              {/* Timeline Grid (Relative container for bars) */}
              <div className="relative flex" style={{ width: `${days.length * 64}px` }}>
                <div className="pointer-events-none border-b border-transparent w-full h-full absolute inset-0">
                   {/* Ghost grid lines could be generated here, but left out for performance. we rely on bar offsets. */}
                </div>
                
                {/* Task Bar */}
                <div 
                  className={`absolute top-2 bottom-2 rounded px-2 py-1 text-xs text-white font-medium border shadow-sm flex items-center overflow-hidden cursor-default transition-transform hover:scale-[1.02] ${getPriorityColor(task.priority)} animate-slide-right stagger-${(idx % 6) + 1}`}
                  style={{
                    left: layout.left,
                    width: `calc(${layout.width} - 8px)`, // small padding between bars
                    marginLeft: '4px'
                  }}
                  title={`${task.title} (${task.status})`}
                >
                  <span className="truncate w-full text-center">
                    {layout.isSingleDay ? '⦿ Due' : task.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
