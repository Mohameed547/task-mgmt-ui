import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
  Divider,
  Zoom,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { TaskStatusSelect } from './TaskStatusSelect';
import { TaskPrioritySelect } from './TaskPrioritySelect';
import type { Task, TaskStatus, TaskPriority, UpdateTaskPayload } from '../types/task.types';

export interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTask?: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onError?: (message: string) => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({
  task,
  open,
  onClose,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
  if (!task) return null;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!onUpdateTask || newStatus === task.status) return;
    try {
      await onUpdateTask(task._id, { status: newStatus });
    } catch (err: any) {
      if (onError) {
        onError(err?.message || 'Failed to update status.');
      }
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!onUpdateTask || newPriority === task.priority) return;
    try {
      await onUpdateTask(task._id, { priority: newPriority });
    } catch (err: any) {
      if (onError) {
        onError(err?.message || 'Failed to update priority.');
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Zoom}
      transitionDuration={250}
      aria-labelledby="task-details-dialog-title"
      PaperProps={{
        elevation: 12,
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        id="task-details-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justify: 'space-between',
          pr: 6,
          pb: 1,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontWeight: 700, lineHeight: 1.3, wordBreak: 'break-word' }}
        >
          {task.title}
        </Typography>

        <IconButton
          aria-label="close task details"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        {/* Due Date Badge */}
        <Box sx={{ mb: 2.5 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              display: 'inline-flex',
              bgcolor: 'action.hover',
              px: 1.5,
              py: 0.6,
              borderRadius: 2,
              color: 'text.secondary',
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              Due Date: {formatDate(task.dueDate)}
            </Typography>
          </Stack>
        </Box>

        {/* Task Description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 700, mb: 0.75, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            Description
          </Typography>
          {task.description ? (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
                lineHeight: 1.6,
                color: 'text.primary',
                fontSize: '0.95rem',
              }}
            >
              {task.description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No description provided for this task.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Quick Inline Controls */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
              Status
            </Typography>
            <TaskStatusSelect status={task.status} onChange={handleStatusChange} />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
              Priority
            </Typography>
            <TaskPrioritySelect priority={task.priority} onChange={handlePriorityChange} />
          </Box>
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => {
            onClose();
            onDeleteTask(task);
          }}
        >
          Delete Task
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button variant="text" color="inherit" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              onClose();
              onEditTask(task);
            }}
          >
            Edit Task
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
