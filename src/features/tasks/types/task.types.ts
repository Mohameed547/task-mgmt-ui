export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFilterParams {
  search?: string;
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface TasksApiResponse {
  status: string;
  message?: string;
  data: Task[];
}

export interface TaskApiResponse {
  status: string;
  message?: string;
  data: Task;
}
