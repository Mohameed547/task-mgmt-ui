import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders } from '../../../test/testUtils';
import { apiClient } from '../../../lib/apiClient';
import { RegisterPage } from './RegisterPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RegisterPage Component', () => {
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

  it('renders register form with all controls and labels', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /full name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  it('validates required fields on empty form submission', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
  });

  it('validates email format', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('validates password length constraint', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('validates password confirmation mismatch', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } });

    fireEvent.click(submitButton);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('toggles password and confirm password visibility', () => {
    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i) as HTMLInputElement;

    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    const togglePasswordBtn = screen.getByRole('button', { name: /^show password$/i });
    fireEvent.click(togglePasswordBtn);
    expect(passwordInput.type).toBe('text');

    const toggleConfirmPasswordBtn = screen.getByRole('button', { name: /show confirm password/i });
    fireEvent.click(toggleConfirmPasswordBtn);
    expect(confirmPasswordInput.type).toBe('text');
  });

  it('handles successful user registration', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'User registered successfully',
        data: {
          id: 'user-123',
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
    });

    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });
      expect(screen.getByText(/account created successfully!/i)).toBeInTheDocument();
    });
  });

  it('displays duplicate email error from backend', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
      status: 'fail',
      statusCode: 409,
      message: 'Email address is already registered',
    });

    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    fireEvent.click(submitButton);

    expect(await screen.findByText(/email address is already registered/i)).toBeInTheDocument();
  });

  it('shows loading state and disables submission during request', async () => {
    let resolveRegister: any;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });

    vi.spyOn(apiClient, 'post').mockImplementationOnce(() => registerPromise as any);

    renderWithProviders(<RegisterPage />, { initialEntries: ['/register'] });

    const nameInput = screen.getByRole('textbox', { name: /full name/i });
    const emailInput = screen.getByRole('textbox', { name: /email address/i });
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });

    fireEvent.click(submitButton);

    expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await act(async () => {
      resolveRegister({
        data: {
          status: 'success',
          data: { id: '1', name: 'Jane Doe', email: 'jane@example.com' },
        },
      });
    });
  });
});
