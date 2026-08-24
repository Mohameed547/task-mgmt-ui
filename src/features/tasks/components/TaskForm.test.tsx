import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from './TaskForm';

describe('TaskForm Component (Create Task Feature)', () => {
  it('form rendering: renders all form controls and action buttons', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('textbox', { name: /task title/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    expect(screen.getAllByText('Status')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Priority')[0]).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('validation: shows field-level validation error when submitting empty title', () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('validation: validates max length constraints for title and description', () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    const descriptionInput = screen.getByRole('textbox', { name: /description/i });
    const submitBtn = screen.getByRole('button', { name: /create task/i });

    // Exceed title 100 limit
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
    // Exceed description 1000 limit
    fireEvent.change(descriptionInput, { target: { value: 'b'.repeat(1001) } });

    fireEvent.click(submitBtn);

    expect(screen.getByText(/title cannot exceed 100 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/description cannot exceed 1000 characters/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('successful creation: submits formatted payload on valid form input', async () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    const descriptionInput = screen.getByRole('textbox', { name: /description/i });
    const submitBtn = screen.getByRole('button', { name: /create task/i });

    fireEvent.change(titleInput, { target: { value: 'Build Enterprise Architecture' } });
    fireEvent.change(descriptionInput, { target: { value: 'Follow SOLID principles and clean code' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Build Enterprise Architecture',
        description: 'Follow SOLID principles and clean code',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: undefined,
      });
    });
  });

  it('API failure: displays backend API error message alert banner', () => {
    render(<TaskForm onSubmit={vi.fn()} apiErrorMessage="Task with title already exists" />);

    expect(screen.getByText(/task with title already exists/i)).toBeInTheDocument();
  });

  it('loading: shows spinner and disables buttons during submission', () => {
    render(<TaskForm onSubmit={vi.fn()} isSubmitting={true} />);

    const titleInput = screen.getByRole('textbox', { name: /task title/i });
    const submitBtn = screen.getByRole('button', { name: /creating\.\.\./i });

    expect(titleInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();
  });

  it('duplicate submission prevention: prevents submitting when isSubmitting is true', () => {
    const handleSubmit = vi.fn();
    render(<TaskForm onSubmit={handleSubmit} isSubmitting={true} />);

    const form = screen.getByRole('button', { name: /creating\.\.\./i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
