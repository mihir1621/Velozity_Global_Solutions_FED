import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { Task, TaskStatus, SortColumn } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { ChevronDown, ChevronUp, ChevronDownSquare } from 'lucide-react';
import { format } from 'date-fns';

const ROW_HEIGHT = 64; 
const BUFFER = 5;

// Custom inline dropdown for editing status inside list row
const StatusDropdown: React.FC<{
  task: Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
}> = ({ task, updateTask }) => {
  const [open, setOpen] = useState(false);
  const statuses: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors w-36 justify-between"
      >
        <span className="truncate">{task.status}</span>
        <ChevronDown size={14} className="text-blue-500 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-10 left-0 w-36 bg-white border border-gray-200 shadow-lg rounded-md z-50 overflow-hidden py-1">
            {statuses.map(s => (
              <button
                key={s}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 ${s === task.status ? 'bg-blue-50/50 font-semibold text-blue-700' : 'text-gray-700'}`}
                onClick={() => {
                  updateTask(task.id, { status: s });
                  setOpen(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};


export const ListView: React.FC = () => {
  const tasks = useStore(state => state.getFilteredSortedTasks());
  const updateTask = useStore(state => state.updateTask);
  const sort = useStore(state => state.sort);
  const setSort = useStore(state => state.setSort);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600); // Default estimate

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
    const ob = new ResizeObserver(entries => {
      for (let entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });
    if (containerRef.current) ob.observe(containerRef.current);
    
    return () => ob.disconnect();
  }, []);

  // Calculate Virtualizer limits
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const visibleItemsCount = Math.ceil(viewportHeight / ROW_HEIGHT);
  const endIndex = Math.min(tasks.length - 1, startIndex + visibleItemsCount + (2 * BUFFER));
  
  const visibleTasks = tasks.slice(startIndex, endIndex + 1);

  const totalHeight = tasks.length * ROW_HEIGHT;
  const offsetY = startIndex * ROW_HEIGHT;

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sort.column !== column) return <ChevronDownSquare className="opacity-0 group-hover:opacity-40" size={14} />;
    return sort.direction === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
  };

  const TheadCell = ({ label, column, align = 'left' }: { label: string, column?: SortColumn, align?: 'left'|'center'|'right' }) => (
    <div
      onClick={() => column && setSort(column)}
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${column ? 'cursor-pointer group flex items-center gap-1 hover:bg-gray-50' : ''} ${align === 'center' ? 'justify-center text-center' : align === 'right' ? 'justify-end text-right' : 'text-left'}`}
    >
      {label}
      {column && <SortIcon column={column} />}
    </div>
  );

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-gray-500">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
        <p>Try adjusting your filters or search criteria.</p>
        <button 
          onClick={() => useStore.getState().clearFilters()}
          className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header (Fixed) */}
      <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50/80 sticky top-0 z-10 w-full pr-[6px]">
        {/* Pr-[6px] above accounts for custom scrollbar overlay width on Windows */}
        <div className="col-span-4"><TheadCell label="Title" column="title" /></div>
        <div className="col-span-2"><TheadCell label="Status" /></div>
        <div className="col-span-2"><TheadCell label="Priority" column="priority" /></div>
        <div className="col-span-2"><TheadCell label="Assignee" /></div>
        <div className="col-span-2"><TheadCell label="Due Date" column="dueDate" align="right" /></div>
      </div>

      {/* Virtual Scroll Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative w-full contain-strict"
      >
        <div style={{ height: `${totalHeight}px`, width: '100%' }}>
          <div 
            style={{ 
              transform: `translateY(${offsetY}px)`, 
              height: `${visibleTasks.length * ROW_HEIGHT}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleTasks.map(t => (
              <div 
                key={t.id} 
                className="grid grid-cols-12 border-b border-gray-100 hover:bg-blue-50/30 transition-colors w-full px-1"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                <div className="col-span-4 flex items-center px-3 font-medium text-gray-900 truncate">
                  {t.title}
                </div>
                <div className="col-span-2 flex items-center px-3">
                  <StatusDropdown task={t} updateTask={updateTask} />
                </div>
                <div className="col-span-2 flex items-center px-3">
                  <PriorityBadge priority={t.priority} />
                </div>
                <div className="col-span-2 flex items-center px-3">
                  <div className="flex items-center gap-2">
                    <Avatar user={t.assignee} size="sm" />
                    <span className="text-sm text-gray-600 truncate">{t.assignee.name}</span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-end px-4 text-sm font-medium text-gray-500">
                  {format(new Date(t.dueDate), 'MMM dd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
