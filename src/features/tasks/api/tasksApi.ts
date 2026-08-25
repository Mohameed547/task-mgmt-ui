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

  const response = await apiClient.get<any>('/tasks', { params });
  const rawData = response.data?.data;

  // Normalization: Support both raw array responses (legacy mocks) and paginated task objects
  if (Array.isArray(rawData)) {
    return {
      tasks: rawData,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || rawData.length || 9,
        total: rawData.length,
        totalPages: 1,
      },
    };
  }

  if (rawData && Array.isArray(rawData.tasks)) {
    return {
      tasks: rawData.tasks,
      pagination: rawData.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || rawData.tasks.length || 9,
        total: rawData.tasks.length,
        totalPages: 1,
      },
    };
  }

  return {
    tasks: [],
    pagination: {
      page: filters?.page || 1,
      limit: filters?.limit || 9,
      total: 0,
      totalPages: 1,
    },
  };
};

export const getTaskById = async (id: string): Promise<Task> => {
  const response = await apiClient.get<TaskApiResponse>(`/tasks/${id}`);
  return response.data.data;
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  if (payload.attachment) {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.description) {
      formData.append('description', payload.description);
    }
    if (payload.status) {
      formData.append('status', payload.status);
    }
    if (payload.priority) {
      formData.append('priority', payload.priority);
    }
    if (payload.dueDate) {
      formData.append('dueDate', payload.dueDate);
    }
    formData.append('attachment', payload.attachment);

    const response = await apiClient.post<TaskApiResponse>('/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  const response = await apiClient.post<TaskApiResponse>('/tasks', payload);
  return response.data.data;
};

export const updateTask = async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
  if (payload.attachment) {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.description !== undefined) formData.append('description', payload.description);
    if (payload.status) formData.append('status', payload.status);
    if (payload.priority) formData.append('priority', payload.priority);
    if (payload.dueDate) formData.append('dueDate', payload.dueDate);
    formData.append('attachment', payload.attachment);

    const response = await apiClient.patch<TaskApiResponse>(`/tasks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  const response = await apiClient.patch<TaskApiResponse>(`/tasks/${id}`, payload);
  return response.data.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};
