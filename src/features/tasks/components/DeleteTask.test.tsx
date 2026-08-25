import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeleteTaskConfirmDialog } from './DeleteTaskConfirmDialog';
import { renderWithProviders } from '../../../test/testUtils';
import { apiClient } from '../../../lib/apiClient';
import { tokenStorage } from '../../auth';
import { TasksPage } from '../pages/TasksPage';
import type { Task } from '../types/task.types';

const mockTaskToDelete: Task = {
  _id: 'task-999',
  title: 'Legacy Auth Controller Cleanup',
  description: 'Remove deprecated v1 endpoints',
  status: 'TODO',
  priority: 'LOW',
  dueDate: '2026-09-10T00:00:00.000Z',
};

describe('Task Deletion Feature', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    tokenStorage.setToken('mock-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('confirmation dialog: renders title, task name, and action buttons', () => {
    render(
      <DeleteTaskConfirmDialog
        open={true}
        taskTitle={mockTaskToDelete.title}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /confirm task deletion/i })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockTaskToDelete.title, 'i'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete task$/i })).toBeInTheDocument();
  });

  it('cancel deletion: closes modal without triggering onConfirm', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <DeleteTaskConfirmDialog
        open={true}
        taskTitle={mockTaskToDelete.title}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('loading state & duplicate prevention: disables buttons and displays Deleting... spinner', () => {
    const handleConfirm = vi.fn();

    render(
      <DeleteTaskConfirmDialog
        open={true}
        taskTitle={mockTaskToDelete.title}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
        isDeleting={true}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    const deleteBtn = screen.getByRole('button', { name: /deleting\.\.\./i });

    expect(cancelBtn).toBeDisabled();
    expect(deleteBtn).toBeDisabled();

    // Trigger click on disabled button
    fireEvent.click(deleteBtn);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('failed deletion: displays error banner when error message prop is passed', () => {
    render(
      <DeleteTaskConfirmDialog
        open={true}
        taskTitle={mockTaskToDelete.title}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        errorMessage="Unauthorized to delete this task"
      />
    );

    expect(screen.getByText(/unauthorized to delete this task/i)).toBeInTheDocument();
  });

  it('successful deletion & task list update: dispatches DELETE /api/tasks/:id and updates UI', async () => {
    vi.spyOn(apiClient, 'get').mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({ data: { status: 'success', data: { id: '1' } } });
      }
      if (url === '/tasks') {
        return Promise.resolve({ data: { status: 'success', data: [mockTaskToDelete] } });
      }
      return Promise.reject(new Error('Not found'));
    });

    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      data: { status: 'success', message: 'Task deleted successfully' },
    });

    renderWithProviders(<TasksPage />, { initialEntries: ['/tasks'] });

    // Wait for task to render on dashboard
    await waitFor(() => {
      expect(screen.getByText('Legacy Auth Controller Cleanup')).toBeInTheDocument();
    });

    // Open details popup modal by clicking task title
    fireEvent.click(screen.getByText('Legacy Auth Controller Cleanup'));

    // Click Delete Task button inside details dialog
    const deleteBtnInDialog = screen.getByRole('button', { name: /^delete task$/i });
    fireEvent.click(deleteBtnInDialog);

    // Confirmation dialog should open
    expect(screen.getByRole('heading', { name: /confirm task deletion/i })).toBeInTheDocument();

    // Click Delete Task button inside confirmation dialog
    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete task$/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/tasks/task-999');
      expect(screen.getByText(/task deleted successfully/i)).toBeInTheDocument();
    });
  });
});
