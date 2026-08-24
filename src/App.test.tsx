import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders workspace dashboard heading without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /Workspace Dashboard/i })).toBeInTheDocument();
  });
});
