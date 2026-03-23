import React from 'react';
import { Task, TaskStatus } from '../../types';
import { KanbanCard } from './KanbanCard';

export const KanbanColumn: React.FC<{
  status: TaskStatus;
  tasks: Task[];
  isDropTarget: boolean;
  draggedTaskId?: string;
  onDragStart: (t: Task, e: React.PointerEvent<HTMLDivElement>) => void;
}> = ({ status, tasks, isDropTarget, draggedTaskId, onDragStart }) => {
  const statusColors: Record<TaskStatus, string> = {
    'To Do': 'border-t-gray-400',
    'In Progress': 'border-t-yellow-400',
    'In Review': 'border-t-purple-400',
    'Done': 'border-t-green-400',
  };

  return (
    <div
      data-droppable-col={status}
      className={`
        flex flex-col bg-slate-50 rounded-xl overflow-hidden w-80 flex-shrink-0 transition-colors
        border-t-4 shadow-sm ${statusColors[status]} 
        ${isDropTarget ? 'bg-indigo-50/70 shadow-inner' : 'border border-gray-200'}
      `}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200/50 bg-white/50">
        <h3 className="font-semibold text-gray-700">{status}</h3>
        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 text-xs font-bold rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-[300px]">
        {tasks.map((task) => {
          if (draggedTaskId === task.id) {
            return <KanbanCard key={task.id} task={task} isPlaceholder />;
          }
          return (
            <div key={task.id} className="relative">
              <KanbanCard task={task} onDragStart={onDragStart} />
            </div>
          );
        })}
        {tasks.length === 0 && !isDropTarget && (
          <div className="flex items-center justify-center h-24 text-sm text-gray-400 font-medium">
            Empty
          </div>
        )}
      </div>
    </div>
  );
};
