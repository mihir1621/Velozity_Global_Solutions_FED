import { format, isPast, isToday, differenceInDays } from 'date-fns';

export function formatDueDate(dueDateISO: string): string {
  const date = new Date(dueDateISO);
  
  if (isToday(date)) {
    return 'Due Today';
  }
  
  if (isPast(date)) {
    const daysOverdue = differenceInDays(new Date(), date);
    if (daysOverdue > 7) {
      return `${daysOverdue} days overdue`;
    }
  }
  
  return format(date, 'MMM d, yyyy');
}
