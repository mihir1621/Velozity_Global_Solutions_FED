import React from 'react';
import { TaskPriority, TaskStatus } from '../../types';

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const colors: Record<TaskPriority, string> = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-blue-100 text-blue-800 border-blue-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${colors[priority]} flex items-center justify-center`}>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const colors: Record<TaskStatus, string> = {
    'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'In Review': 'bg-purple-100 text-purple-800 border-purple-200',
    'Done': 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[status]}`}>
      {status}
    </span>
  );
};
