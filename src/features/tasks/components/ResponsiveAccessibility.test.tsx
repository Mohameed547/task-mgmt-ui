import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from './TaskForm';
import { StatusChip } from '../../../components/StatusChip';
import { PriorityChip } from '../../../components/PriorityChip';
import { TaskFilterToolbar } from './TaskFilterToolbar';
import { DeleteTaskConfirmDialog } from './DeleteTaskConfirmDialog';

describe('Responsive Design & Accessibility (a11y) Verification', () => {
  it('accessible labels: ensures all form controls have descriptive aria labels or associated field labels', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /task title/i })).toHaveAttribute('id', 'task-title');
    expect(screen.getByRole('textbox', { name: /description/i })).toHaveAttribute('id', 'task-description');
    expect(screen.getByLabelText(/due date/i)).toHaveAttribute('type', 'date');
  });

  it('color independence: ensures status and priority chips render icons and text labels alongside color', () => {
    const { rerender } = render(<StatusChip status="IN_PROGRESS" />);

    const statusChip = screen.getByLabelText(/status: in progress/i);
    expect(statusChip).toBeInTheDocument();
    expect(statusChip).toHaveTextContent(/in progress/i);
    expect(statusChip.querySelector('svg')).toBeInTheDocument();

    rerender(<PriorityChip priority="HIGH" />);
    const priorityChip = screen.getByLabelText(/priority: high/i);
    expect(priorityChip).toBeInTheDocument();
    expect(priorityChip).toHaveTextContent(/high/i);
    expect(priorityChip.querySelector('svg')).toBeInTheDocument();
  });

  it('keyboard navigation: supports Tab focus traversal across form elements and action buttons', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    const descriptionInput = screen.getByRole('textbox', { name: /description/i });
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    const submitBtn = screen.getByRole('button', { name: /create task/i });

    titleInput.focus();
    expect(document.activeElement).toBe(titleInput);

    fireEvent.keyDown(titleInput, { key: 'Tab' });
    descriptionInput.focus();
    expect(document.activeElement).toBe(descriptionInput);

    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);

    submitBtn.focus();
    expect(document.activeElement).toBe(submitBtn);
  });

  it('responsive toolbar controls: search, filters, and action buttons render with accessible labels', () => {
    render(
      <TaskFilterToolbar
        searchInput="Auth"
        onSearchChange={vi.fn()}
        statusFilter="ALL"
        onStatusChange={vi.fn()}
        priorityFilter="ALL"
        onPriorityChange={vi.fn()}
        onClearFilters={vi.fn()}
        onCreateClick={vi.fn()}
        hasActiveFilters={true}
      />
    );

    expect(screen.getByRole('textbox', { name: /search tasks by title/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /priority/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search text/i })).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('accessible dialogs: confirmation dialog features fullWidth, title aria binding, and description binding', () => {
    render(
      <DeleteTaskConfirmDialog
        open={true}
        taskTitle="Refactor API Schema"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-task-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-task-dialog-description');

    expect(screen.getByText(/confirm task deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/refactor api schema/i)).toBeInTheDocument();
  });
});
