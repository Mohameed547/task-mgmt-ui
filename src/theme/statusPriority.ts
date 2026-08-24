export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StatusConfig {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  bgLight: string;
  bgDark: string;
  textColorLight: string;
  textColorDark: string;
}

export interface PriorityConfig {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  iconType: 'low' | 'medium' | 'high';
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  TODO: {
    label: 'To Do',
    color: 'default',
    bgLight: '#e2e8f0',
    bgDark: '#334155',
    textColorLight: '#334155',
    textColorDark: '#cbd5e1',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'primary',
    bgLight: '#e0f2fe',
    bgDark: '#075985',
    textColorLight: '#0369a1',
    textColorDark: '#bae6fd',
  },
  DONE: {
    label: 'Done',
    color: 'success',
    bgLight: '#dcfce7',
    bgDark: '#14532d',
    textColorLight: '#15803d',
    textColorDark: '#bbf7d0',
  },
};

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  LOW: {
    label: 'Low',
    color: 'info',
    iconType: 'low',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'warning',
    iconType: 'medium',
  },
  HIGH: {
    label: 'High',
    color: 'error',
    iconType: 'high',
  },
};
