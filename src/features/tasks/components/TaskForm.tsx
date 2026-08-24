import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export interface TaskFormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
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
    setErrors({});
  }, [initialValues]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions

    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
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
