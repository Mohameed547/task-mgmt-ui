/**
 * Converts bytes into a human-readable file size string (Bytes, KB, MB, GB).
 * Example: 245678 -> "239.9 KB", 5242880 -> "5 MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0 || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i === 0) return `${bytes} Bytes`;
  const value = bytes / Math.pow(k, i);
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${formatted} ${sizes[i]}`;
};
