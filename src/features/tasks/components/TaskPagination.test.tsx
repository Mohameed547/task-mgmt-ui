import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TasksPage } from '../pages/TasksPage';
import { apiClient } from '../../../lib/apiClient';

vi.mock('../../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTask1 = {
  _id: 'task-1',
  title: 'Task 1 in TODO',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2026-09-01T00:00:00.000Z',
};

const mockTask2 = {
  _id: 'task-2',
  title: 'Task 2 in IN_PROGRESS',
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  dueDate: '2026-09-02T00:00:00.000Z',
};

const mockTask3 = {
  _id: 'task-3',
  title: 'Task 3 in DONE',
  status: 'DONE',
  priority: 'LOW',
  dueDate: '2026-09-03T00:00:00.000Z',
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderTasksPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TasksPage />
    </QueryClientProvider>
  );
};

describe('Tasks Board Server-Side Pagination & Interaction Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tasks grouped by status and displays total task count chip', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          tasks: [mockTask1, mockTask2, mockTask3],
          pagination: {
            page: 1,
            limit: 9,
            total: 25,
            totalPages: 3,
          },
        },
      },
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1 in TODO')).toBeInTheDocument();
      expect(screen.getByText('Task 2 in IN_PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('Task 3 in DONE')).toBeInTheDocument();
    });

    expect(screen.getByText('25 tasks')).toBeInTheDocument();
  });

  it('renders pagination control when multiple pages exist and handles page click', async () => {
    vi.spyOn(apiClient, 'get')
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          data: {
            tasks: [mockTask1],
            pagination: { page: 1, limit: 9, total: 18, totalPages: 2 },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          data: {
            tasks: [mockTask2],
            pagination: { page: 2, limit: 9, total: 18, totalPages: 2 },
          },
        },
      });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByTestId('tasks-pagination')).toBeInTheDocument();
    });

    // Click on page 2 button
    const page2Button = screen.getByRole('button', { name: /page 2/i });
    fireEvent.click(page2Button);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenLastCalledWith('/tasks', {
        params: { page: 2, limit: 9 },
      });
    });
  });

  it('shows pagination control with 1 page when total tasks are 9 or fewer', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          tasks: [mockTask1],
          pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
        },
      },
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1 in TODO')).toBeInTheDocument();
    });

    expect(screen.getByTestId('tasks-pagination')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /page 1/i })).toBeInTheDocument();
  });

  it('resets page to 1 when search input changes', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        status: 'success',
        data: {
          tasks: [mockTask1],
          pagination: { page: 1, limit: 9, total: 1, totalPages: 1 },
        },
      },
    });

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByText('Task 1 in TODO')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by task title...');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(
      () => {
        expect(apiClient.get).toHaveBeenLastCalledWith('/tasks', {
          params: { search: 'React', page: 1, limit: 9 },
        });
      },
      { timeout: 1000 }
    );
  });

  it('handles loading state during task fetch', () => {
    vi.spyOn(apiClient, 'get').mockReturnValue(new Promise(() => {})); // Never resolves

    renderTasksPage();

    expect(screen.getByTestId('tasks-loading-state')).toBeInTheDocument();
  });

  it('handles API error state gracefully', async () => {
    vi.spyOn(apiClient, 'get').mockRejectedValueOnce(new Error('Network response failed'));

    renderTasksPage();

    await waitFor(() => {
      expect(screen.getByTestId('tasks-error-state')).toBeInTheDocument();
    });

    expect(screen.getByText('Unable to Load Tasks')).toBeInTheDocument();
  });
});
