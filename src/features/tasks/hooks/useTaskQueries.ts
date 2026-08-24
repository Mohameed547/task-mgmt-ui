import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  TASK_QUERY_KEYS,
} from '../api/tasksApi';
import type {
  Task,
  TaskFilterParams,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '../types/task.types';

export const useTasksQuery = (filters?: TaskFilterParams) => {
  return useQuery<Task[], Error>({
    queryKey: TASK_QUERY_KEYS.list(filters),
    queryFn: () => getTasks(filters),
  });
};

export const useTaskQuery = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<Task, Error>({
    queryKey: TASK_QUERY_KEYS.detail(id),
    queryFn: () => getTaskById(id),
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(id),
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskPayload>({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: string; payload: UpdateTaskPayload }>({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      queryClient.removeQueries({ queryKey: TASK_QUERY_KEYS.detail(id) });
    },
  });
};
