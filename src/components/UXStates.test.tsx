import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { TaskForm } from '../features/tasks/components/TaskForm';

describe('UX Reliability States Component Suite', () => {
  it('loading state: renders skeleton table loader with accessibility role="status"', () => {
    render(<LoadingState variant="skeleton" rows={3} />);

    const loadingContainer = screen.getByTestId('ux-loading-state');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveAttribute('role', 'status');
    expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('loading state: renders centered progress spinner when variant="spinner"', () => {
    render(<LoadingState variant="spinner" message="Fetching items..." />);

    expect(screen.getByText('Fetching items...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('error state: renders user-friendly error title, sanitizes stack traces, and supports retry', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        title="Failed to Sync"
        message="Error: NetworkError at axios.ts:45"
        onRetry={handleRetry}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to Sync')).toBeInTheDocument();
    expect(screen.getByText('An unexpected network error occurred. Please try again.')).toBeInTheDocument();
    // Raw stack trace should be hidden
    expect(screen.queryByText(/axios\.ts:45/i)).not.toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('empty state: renders workspace empty prompt with CTA action button', () => {
    const handleAction = vi.fn();
    render(<EmptyState type="empty" onAction={handleAction} />);

    expect(screen.getByTestId('ux-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/no tasks in your workspace yet/i)).toBeInTheDocument();

    const createBtn = screen.getByRole('button', { name: /create first task/i });
    fireEvent.click(createBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('empty state: renders no-results filter prompt with reset button', () => {
    const handleClear = vi.fn();
    render(<EmptyState type="no-results" onAction={handleClear} />);

    expect(screen.getByTestId('ux-no-results-state')).toBeInTheDocument();
    expect(screen.getByText(/no tasks match your filters/i)).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('validation state: renders field-level validation messages and helper text', () => {
    render(<TaskForm onSubmit={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/task title is required/i)).toBeInTheDocument();
  });
});
