import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  IconButton,
  FormHelperText,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatFileSize } from '../../../utils/fileUtils';
import type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export interface TaskFormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  attachment?: string;
  apiError?: string;
}

export interface TaskFormProps {
  initialValues?: Task | null;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  apiErrorMessage?: string;
}

const VALID_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
const VALID_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText,
  apiErrorMessage,
}) => {
  const isEditing = Boolean(initialValues);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<TaskFormErrors>({});

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setDescription(initialValues.description || '');
      setStatus(initialValues.status && VALID_STATUSES.includes(initialValues.status) ? initialValues.status : 'TODO');
      setPriority(initialValues.priority && VALID_PRIORITIES.includes(initialValues.priority) ? initialValues.priority : 'MEDIUM');
      setDueDate(
        initialValues.dueDate
          ? new Date(initialValues.dueDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
    }
    setSelectedFile(null);
    setErrors({});
  }, [initialValues]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setErrors((prev) => ({
        ...prev,
        attachment: 'Invalid file type. Allowed file types: PDF, PNG, JPG, JPEG, DOC, DOCX',
      }));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        attachment: 'File size cannot exceed 5 MB',
      }));
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, attachment: undefined }));
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrors((prev) => ({ ...prev, attachment: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: TaskFormErrors = {};

    // Validate Title
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Validate Description
    if (description && description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    // Validate Status Enum
    if (!VALID_STATUSES.includes(status)) {
      newErrors.status = 'Invalid task status selected';
    }

    // Validate Priority Enum
    if (!VALID_PRIORITIES.includes(priority)) {
      newErrors.priority = 'Invalid task priority selected';
    }

    // Validate Due Date
    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        newErrors.dueDate = 'Please select a valid date';
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    if (!validate()) return;

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      attachment: selectedFile || undefined,
    };

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {(apiErrorMessage || errors.apiError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiErrorMessage || errors.apiError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Task Title */}
        <Grid size={{ xs: 12 }}>
          <TextField
            required
            fullWidth
            id="task-title"
            label="Task Title"
            placeholder="Enter task summary..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={Boolean(errors.title)}
            helperText={errors.title}
            disabled={isSubmitting}
            autoFocus
          />
        </Grid>

        {/* Task Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            id="task-description"
            label="Description"
            placeholder="Add optional context or details..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={Boolean(errors.description)}
            helperText={errors.description}
            disabled={isSubmitting}
          />
        </Grid>

        {/* Task Status */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            id="task-status"
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TaskStatus);
              if (errors.status) setErrors((prev) => ({ ...prev, status: undefined }));
            }}
            error={Boolean(errors.status)}
            helperText={errors.status}
            disabled={isSubmitting}
          >
            <MenuItem value="TODO">To Do</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
          </TextField>
        </Grid>

        {/* Task Priority */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            id="task-priority"
            label="Priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as TaskPriority);
              if (errors.priority) setErrors((prev) => ({ ...prev, priority: undefined }));
            }}
            error={Boolean(errors.priority)}
            helperText={errors.priority}
            disabled={isSubmitting}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </TextField>
        </Grid>

        {/* Due Date */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            type="date"
            id="task-due-date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
            }}
            error={Boolean(errors.dueDate)}
            helperText={errors.dueDate}
            disabled={isSubmitting}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>

        {/* Attachment Section (Create & Edit Task) */}
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 0.75, color: 'text.secondary' }}
          >
            Attachment (Optional)
          </Typography>

          {selectedFile ? (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                <InsertDriveFileIcon color="primary" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedFile.name} {isEditing && '(New)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                aria-label="Remove attachment"
                onClick={handleRemoveFile}
                disabled={isSubmitting}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ) : initialValues?.attachment ? (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                <InsertDriveFileIcon color="primary" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {initialValues.attachment.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(initialValues.attachment.fileSize)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="file"
                  id="task-attachment-replace-input"
                  style={{ display: 'none' }}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />
                <label htmlFor="task-attachment-replace-input">
                  <Button
                    variant="outlined"
                    component="span"
                    size="small"
                    startIcon={<AttachFileIcon />}
                    disabled={isSubmitting}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Replace
                  </Button>
                </label>
              </Box>
            </Paper>
          ) : (
            <Box
              sx={{
                border: '1px dashed',
                borderColor: errors.attachment ? 'error.main' : 'divider',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                bgcolor: 'action.hover',
              }}
            >
              <input
                type="file"
                id="task-attachment-input"
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isSubmitting}
              />
              <label htmlFor="task-attachment-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFileIcon />}
                  disabled={isSubmitting}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Attach File
                </Button>
              </label>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                PDF, PNG, JPG, DOC, DOCX — Maximum size: 5 MB
              </Typography>
            </Box>
          )}

          {errors.attachment && (
            <FormHelperText error sx={{ mt: 0.75 }}>
              {errors.attachment}
            </FormHelperText>
          )}
        </Grid>
      </Grid>

      {/* Form Action Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          sx={{ fontWeight: 600, minWidth: 120 }}
        >
          {isSubmitting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>{isEditing ? 'Saving...' : 'Creating...'}</span>
            </Box>
          ) : (
            submitButtonText || (isEditing ? 'Save Changes' : 'Create Task')
          )}
        </Button>
      </Box>
    </Box>
  );
};
