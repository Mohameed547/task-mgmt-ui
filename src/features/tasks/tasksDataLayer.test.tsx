import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  TASK_QUERY_KEYS,
  useTasksQuery,
  useTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  Task,
} from './index';

const mockTask: Task = {
  _id: 'task-101',
  title: 'Implement Task Data Layer',
  description: 'Create Axios and TanStack Query integration for tasks',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  dueDate: '2026-08-30T00:00:00.000Z',
  user: 'user-1',
  createdAt: '2026-08-24T12:00:00.000Z',
  updatedAt: '2026-08-24T12:00:00.000Z',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Tasks Feature Data Layer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Axios API Functions', () => {
    it('getTasks: fetches tasks list with filter and pagination parameters', async () => {
      const mockPaginatedResponse = {
        tasks: [mockTask],
        pagination: {
          page: 2,
          limit: 9,
          total: 15,
          totalPages: 2,
        },
      };

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: mockPaginatedResponse,
        },
      });

      const result = await getTasks({ search: 'Data Layer', status: 'IN_PROGRESS', priority: 'HIGH', page: 2, limit: 9 });

      expect(apiClient.get).toHaveBeenCalledWith('/tasks', {
        params: {
          search: 'Data Layer',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          page: 2,
          limit: 9,
        },
      });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('getTaskById: fetches single task by ID', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: mockTask,
        },
      });

      const result = await getTaskById('task-101');

      expect(apiClient.get).toHaveBeenCalledWith('/tasks/task-101');
      expect(result).toEqual(mockTask);
    });

    it('createTask: sends POST request with new task payload', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: mockTask,
        },
      });

      const payload = {
        title: 'New Task',
        description: 'New Description',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
      };

      const result = await createTask(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/tasks', payload);
      expect(result).toEqual(mockTask);
    });

    it('updateTask: sends PATCH request with updated fields', async () => {
      const updatedTask = { ...mockTask, status: 'DONE' as const };

      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: updatedTask,
        },
      });

      const result = await updateTask('task-101', { status: 'DONE' });

      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/task-101', { status: 'DONE' });
      expect(result).toEqual(updatedTask);
    });

    it('deleteTask: sends DELETE request for specified task ID', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Task deleted successfully',
        },
      });

      await deleteTask('task-101');

      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/task-101');
    });
  });

  describe('TanStack Query Hooks & Cache Invalidation', () => {
    it('useTasksQuery: fetches and returns paginated tasks data', async () => {
      const mockPaginatedResponse = {
        tasks: [mockTask],
        pagination: {
          page: 1,
          limit: 9,
          total: 1,
          totalPages: 1,
        },
      };

      const queryClient = createTestQueryClient();
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: mockPaginatedResponse,
        },
      });

      const { result } = renderHook(() => useTasksQuery({ status: 'IN_PROGRESS', page: 1, limit: 9 }), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPaginatedResponse);
    });

    it('useTaskQuery: fetches and returns single task details', async () => {
      const queryClient = createTestQueryClient();
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: mockTask,
        },
      });

      const { result } = renderHook(() => useTaskQuery('task-101'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTask);
    });

    it('useCreateTaskMutation: invalidates task list query cache on success', async () => {
      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: mockTask,
        },
      });

      const { result } = renderHook(() => useCreateTaskMutation(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ title: 'Created Task' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TASK_QUERY_KEYS.all });
    });

    it('useUpdateTaskMutation: invalidates both list and detail query caches on success', async () => {
      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        data: {
          status: 'success',
          data: { ...mockTask, status: 'DONE' },
        },
      });

      const { result } = renderHook(() => useUpdateTaskMutation(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 'task-101', payload: { status: 'DONE' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TASK_QUERY_KEYS.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TASK_QUERY_KEYS.detail('task-101') });
    });

    it('useDeleteTaskMutation: invalidates list and removes task from query cache', async () => {
      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');

      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Deleted',
        },
      });

      const { result } = renderHook(() => useDeleteTaskMutation(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate('task-101');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TASK_QUERY_KEYS.all });
      expect(removeSpy).toHaveBeenCalledWith({ queryKey: TASK_QUERY_KEYS.detail('task-101') });
    });

    it('handles API failure state in useTasksQuery', async () => {
      const queryClient = createTestQueryClient();
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Internal Server Error'));

      const { result } = renderHook(() => useTasksQuery(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Internal Server Error');
    });
  });
});
