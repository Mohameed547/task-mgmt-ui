import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import { TaskTable } from './TaskTable';
import type { Task } from '../types/task.types';

const mockTask: Task = {
  _id: 'task-101',
  title: 'Implement Inline Status Editing',
  description: 'Allow status and priority updates directly from task card',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '2026-09-01T00:00:00.000Z',
};

describe('TaskCard & Inline Editing Components', () => {
  it('Task card renders correctly with title, description, status, priority, and actions', () => {
    render(
      <TaskCard
        task={mockTask}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={vi.fn()}
      />
    );

    const titleHeading = screen.getByRole('heading', { level: 2, name: /implement inline status editing/i });
    expect(titleHeading).toBeInTheDocument();
    expect(screen.getByText(/allow status and priority updates directly from task card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current status: to do/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current priority: medium/i)).toBeInTheDocument();

    // Click title to open details popup dialog
    fireEvent.click(titleHeading);
    expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete task/i })).toBeInTheDocument();
  });

  it('Status dropdown opens on click and displays available status options', async () => {
    render(
      <TaskCard
        task={mockTask}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={vi.fn()}
      />
    );

    const statusButton = screen.getByLabelText(/change status for task/i);
    fireEvent.click(statusButton);

    await waitFor(() => {
      expect(screen.getByText(/^In Progress$/i)).toBeInTheDocument();
      expect(screen.getByText(/^Done$/i)).toBeInTheDocument();
    });
  });

  it('Priority dropdown opens on click and displays available priority options', async () => {
    render(
      <TaskCard
        task={mockTask}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={vi.fn()}
      />
    );

    const priorityButton = screen.getByLabelText(/change priority for task/i);
    fireEvent.click(priorityButton);

    await waitFor(() => {
      expect(screen.getByText(/^Low$/i)).toBeInTheDocument();
      expect(screen.getByText(/^High$/i)).toBeInTheDocument();
    });
  });

  it('Changing Status triggers the expected update behavior', async () => {
    const handleUpdateTask = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTask}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
      />
    );

    // Open Status menu
    fireEvent.click(screen.getByLabelText(/change status for task/i));

    // Wait for menu and select "Done"
    await waitFor(() => {
      expect(screen.getByText(/^Done$/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/^Done$/i));

    await waitFor(() => {
      expect(handleUpdateTask).toHaveBeenCalledWith('task-101', { status: 'DONE' });
    });
  });

  it('Changing Priority triggers the expected update behavior', async () => {
    const handleUpdateTask = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={mockTask}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
      />
    );

    // Open Priority menu
    fireEvent.click(screen.getByLabelText(/change priority for task/i));

    // Wait for menu and select "High"
    await waitFor(() => {
      expect(screen.getByText(/^High$/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/^High$/i));

    await waitFor(() => {
      expect(handleUpdateTask).toHaveBeenCalledWith('task-101', { priority: 'HIGH' });
    });
  });

  it('API update failure restores the previous value and triggers error callback', async () => {
    const handleUpdateTask = vi.fn().mockRejectedValue(new Error('Network error on update'));
    const handleError = vi.fn();

    render(
      <TaskCard
        task={mockTask}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={handleUpdateTask}
        onError={handleError}
      />
    );

    // Open Status menu & click "In Progress"
    fireEvent.click(screen.getByLabelText(/change status for task/i));
    await waitFor(() => {
      expect(screen.getByText(/^In Progress$/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/^In Progress$/i));

    await waitFor(() => {
      expect(handleUpdateTask).toHaveBeenCalledWith('task-101', { status: 'IN_PROGRESS' });
      expect(handleError).toHaveBeenCalledWith(expect.stringMatching(/network error/i));
    });

    // Previous status ("To Do") should be restored
    expect(screen.getByLabelText(/current status: to do/i)).toBeInTheDocument();
  });

  it('TaskTable container renders multiple visually independent TaskCard components', () => {
    const tasksList: Task[] = [
      mockTask,
      {
        _id: 'task-102',
        title: 'Refactor UI Components',
        description: 'Ensure cards are visually independent',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2026-09-02T00:00:00.000Z',
      },
    ];

    render(
      <TaskTable
        tasks={tasksList}
        onEditTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onUpdateTask={vi.fn()}
      />
    );

    expect(screen.getByTestId('task-card-task-101')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-task-102')).toBeInTheDocument();
    expect(screen.getByText('Implement Inline Status Editing')).toBeInTheDocument();
    expect(screen.getByText('Refactor UI Components')).toBeInTheDocument();
  });
});
