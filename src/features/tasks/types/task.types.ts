export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskAttachment {
  fileName: string;
  fileUrl: string;
  publicId: string;
  mimeType: string;
  fileSize: number;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  attachment?: TaskAttachment;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskFilterParams {
  search?: string;
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTasksData {
  tasks: Task[];
  pagination: PaginationMeta;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  attachment?: File;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  attachment?: File;
}

export interface TasksApiResponse {
  status: string;
  message?: string;
  data: PaginatedTasksData;
}

export interface TaskApiResponse {
  status: string;
  message?: string;
  data: Task;
}
