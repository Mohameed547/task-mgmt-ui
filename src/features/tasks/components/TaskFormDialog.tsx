import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Box,
} from '@mui/material';
import type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void> | void;
  initialValues?: Task | null;
  isSubmitting?: boolean;
}

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
}) => {
  const isEditing = Boolean(initialValues);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setDescription(initialValues.description || '');
      setStatus(initialValues.status || 'TODO');
      setPriority(initialValues.priority || 'MEDIUM');
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
  }, [initialValues, open]);

  const validate = (): boolean => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="task-form-dialog-title"
    >
      <DialogTitle id="task-form-dialog-title" sx={{ fontWeight: 700 }}>
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Task Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                id="task-title"
                label="Task Title"
                placeholder="Enter concise task summary..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({});
                }}
                error={Boolean(errors.title)}
                helperText={errors.title}
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
                onChange={(e) => setDescription(e.target.value)}
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
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
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
                onChange={(e) => setDueDate(e.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ fontWeight: 600 }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>{isEditing ? 'Saving...' : 'Creating...'}</span>
              </Box>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Task'
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
