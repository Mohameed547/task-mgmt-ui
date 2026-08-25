import { AxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from an unknown error object.
 * Handles Axios HTTP errors, Standard Error instances, and object error payloads.
 */
export const getErrorMessage = (err: unknown, fallbackMessage = 'An unexpected error occurred.'): string => {
  if (!err) {
    return fallbackMessage;
  }

  // Handle Axios HTTP Response Error
  if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
    const axiosError = err as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Handle Standard JavaScript Error
  if (err instanceof Error && err.message) {
    return err.message;
  }

  // Handle Object with message property
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const obj = err as { message?: unknown };
    if (typeof obj.message === 'string') {
      return obj.message;
    }
  }

  // Handle String error
  if (typeof err === 'string' && err.trim().length > 0) {
    return err;
  }

  return fallbackMessage;
};
