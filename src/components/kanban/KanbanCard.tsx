import React from 'react';
import { Task } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Avatar, AvatarGroup } from '../ui/Avatar';
import { Clock, GripHorizontal } from 'lucide-react';
import { isPast, isToday } from 'date-fns';
import { formatDueDate } from '../../utils/dateUtils';

export const KanbanCard: React.FC<{ 
  task: Task; 
  onDragStart?: (t: Task, e: React.PointerEvent<HTMLDivElement>) => void;
  isDraggedClone?: boolean;
  isPlaceholder?: boolean;
  placeholderHeight?: number;
}> = ({ task, onDragStart, isDraggedClone, isPlaceholder, placeholderHeight }) => {
  const isDueToday = isToday(new Date(task.dueDate));
  const isOverdue = isPast(new Date(task.dueDate)) && !isDueToday && task.status !== 'Done';
  
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button === 0 && onDragStart) {
      e.currentTarget.setPointerCapture(e.pointerId);
      onDragStart(task, e);
    }
  };

  if (isPlaceholder) {
    return (
      <div 
        className="rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 w-full mb-3 transition-all duration-200"
        style={{ height: placeholderHeight ? `${placeholderHeight}px` : '120px' }}
      ></div>
    );
  }

  return (
    <div
      className={`
        bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-3 animate-fade-in
        hover:shadow-md transition-shadow select-none
        ${isDraggedClone ? 'opacity-90 shadow-xl scale-105 rotate-2 z-50 absolute w-full' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-2">
          <Avatar user={task.assignee} size="sm" />
          <div 
             onPointerDown={handlePointerDown}
             className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded cursor-grab active:cursor-grabbing"
             style={{ touchAction: 'none' }}
          >
            <GripHorizontal size={16} />
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-semibold text-gray-900 mb-3 leading-tight">{task.title}</h4>
      
      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-amber-600 font-medium' : ''}`}>
          <Clock size={12} />
          {formatDueDate(task.dueDate)}
        </div>
        
        {task.viewingUsers && task.viewingUsers.length > 0 && (
          <AvatarGroup users={task.viewingUsers} maxCount={2} />
        )}
      </div>
    </div>
  );
};
