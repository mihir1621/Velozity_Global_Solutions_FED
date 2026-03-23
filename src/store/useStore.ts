import { create } from 'zustand';
import { Task, FilterState, ViewMode, SortState, TaskPriority, Assignee } from '../types';
import { generateTasks, SIMULATED_ONLINE_USERS } from '../utils/dataGenerator';

interface AppState {
  tasks: Task[];
  filters: FilterState;
  sort: SortState;
  viewMode: ViewMode;
  
  // Actions
  initializeTasks: () => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setSort: (column: SortState['column']) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Collaboration
  simulateCollaboration: () => void;
  
  // Getters
  getFilteredSortedTasks: () => Task[];
}

const defaultFilters: FilterState = {
  status: [],
  priority: [],
  assignees: [],
  dueDateRange: { start: null, end: null },
};

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  filters: defaultFilters,
  sort: { column: 'dueDate', direction: 'asc' },
  viewMode: 'Kanban',
  
  initializeTasks: () => {
    set({ tasks: generateTasks(505) });
  },
  
  updateTask: (id: string, updates: Partial<Task>) => {
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
  },
  
  setFilters: (newFilters: Partial<FilterState>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },
  
  clearFilters: () => {
    set({ filters: defaultFilters });
  },
  
  setSort: (column: SortState['column']) => {
    set(state => {
      if (state.sort.column === column) {
        return {
          sort: {
            ...state.sort,
            direction: state.sort.direction === 'asc' ? 'desc' : 'asc'
          }
        };
      }
      return {
        sort: {
          column,
          direction: 'asc'
        }
      };
    });
  },
  
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },
  
  simulateCollaboration: () => {
    set(state => {
      const allTasks = [...state.tasks].map(t => ({ ...t, viewingUsers: [] as Assignee[] }));
      
      SIMULATED_ONLINE_USERS.forEach(user => {
        const tIndex = Math.floor(Math.random() * allTasks.length);
        allTasks[tIndex].viewingUsers = allTasks[tIndex].viewingUsers || [];
        allTasks[tIndex].viewingUsers!.push(user);
      });
      return { tasks: allTasks };
    });
  },
  
  getFilteredSortedTasks: () => {
    const { tasks, filters, sort } = get();
    
    // 1. Filter
    let result = tasks.filter(t => {
      if (filters.status.length > 0 && !filters.status.includes(t.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(t.priority)) return false;
      if (filters.assignees.length > 0 && !filters.assignees.includes(t.assignee.id)) return false;
      if (filters.dueDateRange.start && new Date(t.dueDate) < new Date(filters.dueDateRange.start)) return false;
      
      // We parse end date as the end of the day to make it inclusive
      if (filters.dueDateRange.end) {
        const endDay = new Date(filters.dueDateRange.end);
        endDay.setHours(23, 59, 59, 999);
        if (new Date(t.dueDate) > endDay) return false;
      }
      return true;
    });
    
    // 2. Sort
    if (sort.column) {
      result = result.sort((a, b) => {
        let valA: any = a[sort.column!];
        let valB: any = b[sort.column!];
        
        if (sort.column === 'dueDate') {
          valA = new Date(a.dueDate).getTime();
          valB = new Date(b.dueDate).getTime();
        } else if (sort.column === 'priority') {
          // Critical -> High -> Medium -> Low
          const pOrder: Record<TaskPriority, number> = {
            'Critical': 4,
            'High': 3,
            'Medium': 2,
            'Low': 1,
          };
          valA = pOrder[a.priority as TaskPriority];
          valB = pOrder[b.priority as TaskPriority];
        }
        
        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }
}));
