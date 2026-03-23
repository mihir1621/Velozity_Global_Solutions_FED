import React from 'react';
import { Task } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Avatar, AvatarGroup } from '../ui/Avatar';
import { Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export const KanbanCard: React.FC<{ 
  task: Task; 
  onDragStart?: (t: Task, e: React.PointerEvent<HTMLDivElement>) => void;
  isDraggedClone?: boolean;
  isPlaceholder?: boolean;
}> = ({ task, onDragStart, isDraggedClone, isPlaceholder }) => {
  const isDueToday = isToday(new Date(task.dueDate));
  const isOverdue = isPast(new Date(task.dueDate)) && !isDueToday && task.status !== 'Done';
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Only capture primary button (not right click)
    if (e.button === 0 && onDragStart) {
      e.currentTarget.setPointerCapture(e.pointerId);
      onDragStart(task, e);
    }
  };

  if (isPlaceholder) {
    return (
      <div 
        className="rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 w-full mb-3"
        style={{ height: '120px' }}
      ></div>
    );
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`
        bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing mb-3
        hover:shadow-md transition-shadow select-none
        ${isDraggedClone ? 'opacity-90 shadow-xl scale-105 rotate-2 z-50 absolute w-full' : ''}
      `}
      style={{ touchAction: 'none' }}
    >
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        <Avatar user={task.assignee} size="sm" />
      </div>
      
      <h4 className="text-sm font-semibold text-gray-900 mb-3 leading-tight">{task.title}</h4>
      
      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-amber-600 font-medium' : ''}`}>
          <Clock size={12} />
          {isOverdue 
            ? `${Math.floor((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 3600 * 24))}d overdue` 
            : isDueToday 
              ? 'Due Today'
              : format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
        
        {task.viewingUsers && task.viewingUsers.length > 0 && (
          <AvatarGroup users={task.viewingUsers} maxCount={2} />
        )}
      </div>
    </div>
  );
};
