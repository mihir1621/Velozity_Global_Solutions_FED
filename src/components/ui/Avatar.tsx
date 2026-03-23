import React from 'react';
import { Assignee } from '../../types';

interface AvatarProps {
  user: Assignee;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '', showTooltip = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full text-white font-medium ring-2 ring-white cursor-pointer ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: user.avatarColor }}
      title={showTooltip ? user.name : undefined}
    >
      {user.initials}
    </div>
  );
};

interface AvatarGroupProps {
  users: Assignee[];
  maxCount?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, maxCount = 3 }) => {
  if (!users || users.length === 0) return null;
  
  const visible = users.slice(0, maxCount);
  const extra = users.length - maxCount;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visible.map((user, i) => (
        <Avatar key={`${user.id}-${i}`} user={user} size="sm" className={`z-[${10 - i}]`} />
      ))}
      {extra > 0 && (
        <div className={`relative inline-flex items-center justify-center rounded-full text-white bg-gray-500 font-medium ring-2 ring-white z-0 w-6 h-6 text-[10px]`}>
          +{extra}
        </div>
      )}
    </div>
  );
};
