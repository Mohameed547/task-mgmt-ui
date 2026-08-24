import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskForm } from './TaskForm';
import { renderWithProviders } from '../../../test/testUtils';
import { apiClient } from '../../../lib/apiClient';
import { tokenStorage } from '../../auth';
import { TasksPage } from '../pages/TasksPage';
import type { Task } from '../types/task.types';

const mockExistingTask: Task = {
  _id: 'task-100',
  title: 'Refactor Authentication Flow',
  description: 'Implement JWT refresh tokens and session storage',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  dueDate: '2026-09-01T00:00:00.000Z',
};

describe('TaskForm Edit Task Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    tokenStorage.setToken('mock-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('pre-populated values: pre-fills form fields with existing task data', () => {
    render(<TaskForm initialValues={mockExistingTask} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /task title/i })).toHaveValue('Refactor Authentication Flow');
    expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue('Implement JWT refresh tokens and session storage');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-09-01');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('validation: validates required title when editing an existing task', () => {
    const handleSubmit = vi.fn();
    render(<TaskForm initialValues={mockExistingTask} onSubmit={handleSubmit} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    // Clear title field
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('successful update: submits updated payload when form fields are modified', async () => {
    const handleSubmit = vi.fn();
    render(<TaskForm initialValues={mockExistingTask} onSubmit={handleSubmit} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    fireEvent.change(titleInput, { target: { value: 'Refactor Auth & Session Flow' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Refactor Auth & Session Flow',
        description: 'Implement JWT refresh tokens and session storage',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-09-01T00:00:00.000Z',
      });
    });
  });

  it('failed update: displays backend error alert banner on edit failure', () => {
    render(
      <TaskForm
        initialValues={mockExistingTask}
        onSubmit={vi.fn()}
        apiErrorMessage="Failed to update task: Server Error"
      />
    );

    expect(screen.getByText(/failed to update task: server error/i)).toBeInTheDocument();
  });

  it('loading state: displays Saving... and disables form controls during update submission', () => {
    render(<TaskForm initialValues={mockExistingTask} onSubmit={vi.fn()} isSubmitting={true} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    const submitBtn = screen.getByRole('button', { name: /saving\.\.\./i });

    expect(titleInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
  });

  it('task list update & filter preservation: executes PATCH request and refreshes query cache', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: { status: 'success', data: { id: '1' } } });
      }
      if (url === '/tasks') {
        return Promise.resolve({ data: { status: 'success', data: [mockExistingTask] } });
      }
      return Promise.reject(new Error('Not found'));
    });

    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { ...mockExistingTask, title: 'Updated Auth Flow' },
      },
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    await waitFor(() => {
      expect(screen.getByText('Refactor Authentication Flow')).toBeInTheDocument();
    });

    // Click Edit icon on task row
    const editBtn = screen.getByRole('button', { name: /edit task refactor authentication flow/i });
    fireEvent.click(editBtn);

    // Edit modal title heading should appear
    expect(screen.getByRole('heading', { name: /edit task/i })).toBeInTheDocument();

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    fireEvent.change(titleInput, { target: { value: 'Updated Auth Flow' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/tasks/task-100', {
        title: 'Updated Auth Flow',
        description: 'Implement JWT refresh tokens and session storage',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-09-01T00:00:00.000Z',
      });
      expect(screen.getByText(/task updated successfully/i)).toBeInTheDocument();
    });
  });
});
