import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from './test/testUtils';
import { StatusChip } from './components/StatusChip';
import { PriorityChip } from './components/PriorityChip';

describe('Status & Priority Visual Components', () => {
  it('renders StatusChip correctly for TODO, IN_PROGRESS, and DONE', () => {
    const { rerender } = renderWithProviders(<StatusChip status="TODO" />);
    expect(screen.getByText('To Do')).toBeInTheDocument();

    rerender(<StatusChip status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusChip status="DONE" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders PriorityChip correctly for LOW, MEDIUM, and HIGH', () => {
    const { rerender } = renderWithProviders(<PriorityChip priority="LOW" />);
    expect(screen.getByText('Low')).toBeInTheDocument();

    rerender(<PriorityChip priority="MEDIUM" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<PriorityChip priority="HIGH" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});
