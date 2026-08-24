import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../../test/testUtils';
import { apiClient } from '../../../lib/apiClient';
import { LoginPage } from './LoginPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    vi.restoreAllMocks();
  });

  it('renders login form with all elements', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates empty email field on form submission', async () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/email address is required/i)).toBeInTheDocument();
  });

  it('validates invalid email format', async () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email-format' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('validates empty password field on form submission', async () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('toggles password visibility when toggle button is clicked', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');

    const hideButton = screen.getByRole('button', { name: /hide password/i });
    fireEvent.click(hideButton);

    expect(passwordInput.type).toBe('password');
  });

  it('submits valid credentials and navigates to protected dashboard on success', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'Login successful',
        data: {
          user: { id: '1', name: 'John Doe', email: 'john@example.com' },
          token: 'mock-jwt-token',
        },
      },
    });

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'john@example.com',
        password: 'Secret123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state and disables submit button during submission', async () => {
    let resolveLogin: any;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    vi.spyOn(apiClient, 'post').mockImplementationOnce(() => loginPromise as any);

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });

    fireEvent.click(submitButton);

    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Clean up pending promise inside act
    await act(async () => {
      resolveLogin({
        data: {
          status: 'success',
          data: { user: { id: '1', name: 'John Doe', email: 'john@example.com' }, token: 'mock' },
        },
      });
    });
  });

  it('displays API error alert when login fails', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
      status: 'fail',
      statusCode: 401,
      message: 'Invalid email or password',
    });

    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] });

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
