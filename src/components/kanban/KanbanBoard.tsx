import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { createPortal } from 'react-dom';
import { KanbanCard } from './KanbanCard';

export const KanbanBoard: React.FC = () => {
  const getFilteredSortedTasks = useStore(state => state.getFilteredSortedTasks);
  const rawTasks = useStore(state => state.tasks);
  const filters = useStore(state => state.filters);
  const sort = useStore(state => state.sort);
  
  const tasks = React.useMemo(() => getFilteredSortedTasks(), [
    getFilteredSortedTasks, rawTasks, filters, sort
  ]);
  const updateTask = useStore(state => state.updateTask);
  
  const columns: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

  // DND State
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeDropCol, setActiveDropCol] = useState<TaskStatus | null>(null);
  const [draggedRect, setDraggedRect] = useState<DOMRect | null>(null);
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  
  const originalColRef = useRef<TaskStatus | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Stop dragging on unmount or escape
  const stopDrag = useCallback(() => {
    setDraggedTask(null);
    setActiveDropCol(null);
    setDraggedRect(null);
    setIsSnappingBack(false);
    originalColRef.current = null;
    document.body.style.userSelect = 'auto';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopDrag();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopDrag]);

  // Pointer move handler globally attached to window so it tracks even if out of bounds
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggedTask) return;
    
    // Smoothly update position
    setPointerPos({ x: e.clientX, y: e.clientY });
    
    // Find column we are hovering over (simplified: use elementFromPoint)
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const colElement = elements.find(el => el.getAttribute('data-droppable-col'));
    
    if (colElement) {
      const colStatus = colElement.getAttribute('data-droppable-col') as TaskStatus;
      if (activeDropCol !== colStatus) {
        setActiveDropCol(colStatus);
      }
    } else {
      if (activeDropCol !== null) {
        setActiveDropCol(null);
      }
    }
  }, [draggedTask, activeDropCol]);

  const handlePointerUp = useCallback(() => {
    if (!draggedTask) return;
    
    if (activeDropCol && activeDropCol !== draggedTask.status) {
      updateTask(draggedTask.id, { status: activeDropCol });
      stopDrag();
    } else {
      setIsSnappingBack(true);
      setTimeout(() => {
        stopDrag();
      }, 300); // matches duration-300
    }
  }, [draggedTask, activeDropCol, updateTask, stopDrag]);

  useEffect(() => {
    if (draggedTask) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', stopDrag);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, [draggedTask, handlePointerMove, handlePointerUp, stopDrag]);


  const onDragStart = (task: Task, e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedRect(rect);
    setDragOffset({ x: offsetX, y: offsetY });
    setPointerPos({ x: e.clientX, y: e.clientY });
    setDraggedTask(task);
    originalColRef.current = task.status;
    
    document.body.style.userSelect = 'none'; // prevent text selection
  };

  return (
    <div className="flex-1 flex overflow-x-auto h-full overflow-y-hidden pb-6 gap-6" ref={boardRef}>
      {columns.map((status, index) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          isDropTarget={activeDropCol === status}
          onDragStart={onDragStart}
          draggedTaskId={draggedTask?.id}
          placeholderHeight={draggedTask?.id ? draggedRect?.height : undefined}
          staggerIdx={index + 1}
        />
      ))}

      {/* Render dragged task via portal to body for absolute positioning above all */}
      {draggedTask && createPortal(
        <div
          className={`fixed pointer-events-none z-50 shadow-xl ${
            isSnappingBack 
              ? 'transition-all duration-300 ease-out opacity-100 scale-100 rotate-0' 
              : 'transform rotate-3 scale-105 transition-transform'
          }`}
          style={{
            left: isSnappingBack && draggedRect ? draggedRect.left : pointerPos.x - dragOffset.x,
            top: isSnappingBack && draggedRect ? draggedRect.top : pointerPos.y - dragOffset.y,
            width: draggedRect ? draggedRect.width : 280,
          }}
        >
          <KanbanCard task={draggedTask} isDraggedClone={true} />
        </div>,
        document.body
      )}
    </div>
  );
};
