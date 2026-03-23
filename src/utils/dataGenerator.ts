import { v4 as uuidv4 } from 'uuid';
import { Assignee, Task, TaskPriority, TaskStatus } from '../types';

const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory', 'Nina', 'Olivia', 'Peggy', 'Quinn', 'Rupert', 'Sybil', 'Trent', 'Uma', 'Victor', 'Wendy', 'Xander', 'Yasmine', 'Zack'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const TASK_CATEGORIES = ['Database', 'API', 'Frontend', 'Auth', 'CI/CD', 'Documentation', 'Refactoring', 'Design', 'Testing', 'Security'];
const TASK_ACTIONS = ['Implement', 'Fix', 'Update', 'Review', 'Design', 'Refactor', 'Test', 'Optimize', 'Deploy', 'Setup'];

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITIES: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low'];

export const generateAssignees = (count: number): Assignee[] => {
  return Array.from({ length: count }, () => {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return {
      id: uuidv4(),
      name: `${fn} ${ln}`,
      initials: `${fn[0]}${ln[0]}`,
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  });
};

export const MOCK_USERS = generateAssignees(15); 
// 4 simulated online users for the live collaboration
export const SIMULATED_ONLINE_USERS = MOCK_USERS.slice(0, 4);

export const generateTasks = (count: number): Task[] => {
  const result: Task[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const act = TASK_ACTIONS[Math.floor(Math.random() * TASK_ACTIONS.length)];
    const cat = TASK_CATEGORIES[Math.floor(Math.random() * TASK_CATEGORIES.length)];
    const title = `${act} ${cat} Module ${i + 1}`;
    
    // Dates: 
    // Start Date: mostly past to future (e.g. -14 to +14 days)
    // Due Date: start date + (1 to 14 days)
    const hasStartDate = Math.random() > 0.2; // 80% tasks have start date
    
    let startD: Date | undefined;
    let dueD: Date;
    
    const startOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const duration = Math.floor(Math.random() * 20) + 1; // 1 to 20 days
    
    if (hasStartDate) {
      startD = new Date(today);
      startD.setDate(today.getDate() + startOffset);
      dueD = new Date(startD);
      dueD.setDate(startD.getDate() + duration);
    } else {
      dueD = new Date(today);
      dueD.setDate(today.getDate() + startOffset + duration);
    }

    result.push({
      id: uuidv4(),
      title,
      assignee: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
      priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      startDate: startD ? startD.toISOString() : undefined,
      dueDate: dueD.toISOString(),
      viewingUsers: [] // Used for simulated live collab
    });
  }
  return result;
};
