import { describe, it, expect } from 'vitest';
import { formatFileSize } from './fileUtils';

describe('formatFileSize Utility', () => {
  it('formats 0 bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats bytes less than 1 KB correctly', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  it('formats exact 1 KB correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formats fractional KB values correctly', () => {
    expect(formatFileSize(245678)).toBe('239.9 KB');
  });

  it('formats exact 5 MB correctly', () => {
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('formats exact 1 MB correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('handles negative or invalid values gracefully', () => {
    expect(formatFileSize(-100)).toBe('0 Bytes');
    expect(formatFileSize(NaN)).toBe('0 Bytes');
  });
});
