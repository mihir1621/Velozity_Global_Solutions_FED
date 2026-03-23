export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: Assignee;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string; // ISO format date string
  dueDate: string;    // ISO format date string
  
  // Collaboration
  viewingUsers?: Assignee[];
}

export interface FilterState {
  status: TaskStatus[];
  priority: TaskPriority[];
  assignees: string[];
  dueDateRange: {
    start: string | null;
    end: string | null;
  };
}

export type SortColumn = 'title' | 'priority' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: SortColumn | null;
  direction: SortDirection;
}

// Global UI View State
export type ViewMode = 'Kanban' | 'List' | 'Timeline';
