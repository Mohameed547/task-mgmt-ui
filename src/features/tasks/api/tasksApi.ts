import { apiClient } from '../../../lib/apiClient';
import type {
  Task,
  TaskFilterParams,
  PaginatedTasksData,
  CreateTaskPayload,
  UpdateTaskPayload,
  TasksApiResponse,
  TaskApiResponse,
} from '../types/task.types';

export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: TaskFilterParams) => [...TASK_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
};

export const getTasks = async (filters?: TaskFilterParams): Promise<PaginatedTasksData> => {
  const params: Record<string, string | number> = {};

  if (filters?.search?.trim()) {
    params.search = filters.search.trim();
  }

  if (filters?.status && filters.status !== 'ALL') {
    params.status = filters.status;
  }

  if (filters?.priority && filters.priority !== 'ALL') {
    params.priority = filters.priority;
  }

  if (filters?.page) {
    params.page = filters.page;
  }

  if (filters?.limit) {
    params.limit = filters.limit;
  }

  const response = await apiClient.get<TasksApiResponse>('/tasks', { params });
  return response.data.data;
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await apiClient.get<TaskApiResponse>(`/tasks/${id}`);
  return response.data.data;
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const response = await apiClient.post<TaskApiResponse>('/tasks', payload);
  return response.data.data;
};

export const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
  const response = await apiClient.patch<TaskApiResponse>(`/tasks/${id}`, payload);
  return response.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};
