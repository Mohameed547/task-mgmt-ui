import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../../test/testUtils';
import { apiClient } from '../../../lib/apiClient';
import { tokenStorage } from '../../auth';
import { TasksPage } from './TasksPage';
import type { Task } from '../types/task.types';

const mockTasks: Task[] = [
  {
    _id: 'task-1',
    title: 'Design Material UI Layout',
    description: 'Implement dark/light themes and responsive drawer',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: '2026-08-25T00:00:00.000Z',
  },
  {
    _id: 'task-2',
    title: 'Integrate Axios Interceptors',
    description: 'Inject Bearer tokens automatically',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-08-28T00:00:00.000Z',
  },
];

describe('TasksPage Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    tokenStorage.setToken('mock-jwt-token');

    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            status: 'success',
            data: { id: '1', name: 'John Doe', email: 'john@example.com' },
          },
        });
      }
      if (url === '/tasks') {
        return Promise.resolve({
          data: {
            status: 'success',
            data: mockTasks,
          },
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('dashboard renders heading, count badge, and task list', async () => {
    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /tasks board/i })).toBeInTheDocument();
      expect(screen.getByText('2 tasks')).toBeInTheDocument();
      expect(screen.getByText('Design Material UI Layout')).toBeInTheDocument();
      expect(screen.getByText('Integrate Axios Interceptors')).toBeInTheDocument();
    });
  }, 10000);

  it('loading state: displays loading spinner while fetching tasks', async () => {
    let resolveTasks: any;
    const tasksPromise = new Promise((resolve) => {
      resolveTasks = resolve;
    });

    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: { status: 'success', data: { id: '1', name: 'John Doe' } },
        });
      }
      if (url === '/tasks') {
        return tasksPromise as any;
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    expect(screen.getByTestId('tasks-loading-state')).toBeInTheDocument();
    expect(screen.getByText(/loading workspace tasks\.\.\./i)).toBeInTheDocument();

    // Clean up promise
    resolveTasks({ data: { status: 'success', data: [] } });
  });

  it('empty state: displays empty prompt when no tasks exist in workspace', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: { status: 'success', data: { id: '1' } } });
      }
      if (url === '/tasks') {
        return Promise.resolve({ data: { status: 'success', data: [] } });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByTestId('tasks-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/no tasks in your workspace yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create first task/i })).toBeInTheDocument();
    });
  });

  it('error state: displays error alert banner when API request fails', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: { status: 'success', data: { id: '1' } } });
      }
      if (url === '/tasks') {
        return Promise.reject(new Error('Network Error'));
      }
      return Promise.reject(new Error('Not found'));
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByTestId('tasks-error-state')).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('search & filters: passes search input and clear action correctly', async () => {
    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByText('Design Material UI Layout')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('textbox', { name: /search tasks by title/i });
    fireEvent.change(searchInput, { target: { value: 'Material' } });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/tasks', {
        params: expect.objectContaining({ search: 'Material' }),
      });
    });

    const clearButton = screen.getByRole('button', { name: /clear search and filters/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('create task interaction: opens dialog and submits new task', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          _id: 'task-3',
          title: 'Newly Created Task',
          status: 'TODO',
          priority: 'MEDIUM',
        },
      },
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByRole('heading', { name: /create new task/i })).toBeInTheDocument();

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    fireEvent.change(titleInput, { target: { value: 'Newly Created Task' } });

    const submitBtn = screen.getByRole('button', { name: /^create task$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/tasks', {
        title: 'Newly Created Task',
        description: undefined,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: undefined,
      });
      expect(screen.getByText(/task created successfully/i)).toBeInTheDocument();
    });
  });

  it('delete task interaction: opens confirm dialog and deletes task', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: { status: 'success', message: 'Task deleted' },
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByText('Design Material UI Layout')).toBeInTheDocument();
    });

    // Open details modal by clicking task title
    fireEvent.click(screen.getByText('Design Material UI Layout'));

    // Click Delete Task button inside details popup modal
    const deleteBtn = screen.getByRole('button', { name: /^delete task$/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByRole('heading', { name: /confirm task deletion/i })).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete task$/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/task-1');
      expect(screen.getByText(/task deleted successfully/i)).toBeInTheDocument();
    });
  });
});
