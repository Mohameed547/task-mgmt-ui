import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { apiClient } from './lib/apiClient';

describe('Axios API Client Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('has configured default baseURL', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.baseURL).toContain('http');
  });

  it('attaches Authorization token from localStorage if present', async () => {
    localStorage.setItem('token', 'test-jwt-bearer-token');

    // Test request config directly via request interceptor
    // @ts-expect-error accessing internal interceptors for testing
    const requestInterceptor = apiClient.interceptors.request.handlers[0];

    const config = await requestInterceptor.fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer test-jwt-bearer-token');
  });

  it('does not attach Authorization header if localStorage token is absent', async () => {
    // @ts-expect-error accessing internal interceptors for testing
    const requestInterceptor = apiClient.interceptors.request.handlers[0];

    const config = await requestInterceptor.fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});
