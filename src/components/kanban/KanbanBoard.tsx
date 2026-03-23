import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { Task, TaskStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { createPortal } from 'react-dom';
import { KanbanCard } from './KanbanCard';

export const KanbanBoard: React.FC = () => {
  const tasks = useStore(state => state.getFilteredSortedTasks());
  const updateTask = useStore(state => state.updateTask);
  
  const columns: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];

  // DND State
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeDropCol, setActiveDropCol] = useState<TaskStatus | null>(null);
  
  const originalColRef = useRef<TaskStatus | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Stop dragging on unmount or escape
  const stopDrag = useCallback(() => {
    setDraggedTask(null);
    setActiveDropCol(null);
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
    
    // Dropped outside constraints or on same column -> snap back (no update)
    if (activeDropCol && activeDropCol !== draggedTask.status) {
      updateTask(draggedTask.id, { status: activeDropCol });
    }
    
    stopDrag();
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
    e.preventDefault(); // Prevent touch scroll
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setPointerPos({ x: e.clientX, y: e.clientY });
    setDraggedTask(task);
    originalColRef.current = task.status;
    
    document.body.style.userSelect = 'none'; // prevent text selection
  };

  return (
    <div className="flex-1 flex overflow-x-auto p-6 gap-6" ref={boardRef} style={{ touchAction: 'none' }}>
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          isDropTarget={activeDropCol === status}
          onDragStart={onDragStart}
          draggedTaskId={draggedTask?.id}
        />
      ))}

      {/* Render dragged task via portal to body for absolute positioning above all */}
      {draggedTask && createPortal(
        <div
          className="fixed pointer-events-none z-50 transform rotate-3 scale-105 shadow-xl transition-transform"
          style={{
            left: pointerPos.x - dragOffset.x,
            top: pointerPos.y - dragOffset.y,
            width: '280px', // Set to match column task card width roughly
          }}
        >
          <KanbanCard task={draggedTask} isDraggedClone={true} />
        </div>,
        document.body
      )}
    </div>
  );
};
