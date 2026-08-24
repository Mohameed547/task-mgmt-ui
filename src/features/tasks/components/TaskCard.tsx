import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Stack,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { TaskStatusSelect } from './TaskStatusSelect';
import { TaskPrioritySelect } from './TaskPrioritySelect';
import type { Task, TaskStatus, TaskPriority, UpdateTaskPayload } from '../types/task.types';

export interface TaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTask?: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onError?: (message: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
  const [currentPriority, setCurrentPriority] = useState<TaskPriority>(task.priority);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  useEffect(() => {
    setCurrentStatus(task.status);
  }, [task.status]);

  useEffect(() => {
    setCurrentPriority(task.priority);
  }, [task.priority]);

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
    if (newStatus === currentStatus || isUpdatingStatus) return;

    const previousStatus = currentStatus;
    setCurrentStatus(newStatus); // Optimistic UI update
    setIsUpdatingStatus(true);

    try {
      if (onUpdateTask) {
        await onUpdateTask(task._id, { status: newStatus });
      }
    } catch (err: any) {
      setCurrentStatus(previousStatus); // Rollback on failure
      const errorMsg = err?.message || 'Failed to update status. Previous status restored.';
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (newPriority === currentPriority || isUpdatingPriority) return;

    const previousPriority = currentPriority;
    setCurrentPriority(newPriority); // Optimistic UI update
    setIsUpdatingPriority(true);

    try {
      if (onUpdateTask) {
        await onUpdateTask(task._id, { priority: newPriority });
      }
    } catch (err: any) {
      setCurrentPriority(previousPriority); // Rollback on failure
      const errorMsg = err?.message || 'Failed to update priority. Previous priority restored.';
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  return (
    <Card
      variant="outlined"
      elevation={1}
      data-testid={`task-card-${task._id}`}
      sx={{
        borderRadius: 2,
        mb: 2,
        transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
        '&:hover': {
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 16px rgba(0, 0, 0, 0.4)'
              : '0 4px 16px rgba(0, 0, 0, 0.08)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        {/* Header Row: Title (Left) & Due Date + Actions (Right) */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              color: 'text.primary',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {task.title}
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {/* Due Date Badge */}
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                bgcolor: 'action.hover',
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                color: 'text.secondary',
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {formatDate(task.dueDate)}
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Edit task">
                <IconButton
                  size="small"
                  color="primary"
                  aria-label={`Edit task ${task.title}`}
                  onClick={() => onEditTask(task)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete task">
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Delete task ${task.title}`}
                  onClick={() => onDeleteTask(task)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Task Description */}
        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 1.5,
              fontSize: '0.875rem',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {task.description}
          </Typography>
        )}

        <Divider sx={{ my: 1.5, borderColor: 'divider' }} />

        {/* Footer / Controls Row: Inline Status & Inline Priority */}
        <Stack direction="row" spacing={2.5} sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, fontWeight: 500 }}>
              Status
            </Typography>
            <TaskStatusSelect
              status={currentStatus}
              onChange={handleStatusChange}
              isUpdating={isUpdatingStatus}
            />
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, fontWeight: 500 }}>
              Priority
            </Typography>
            <TaskPrioritySelect
              priority={currentPriority}
              onChange={handlePriorityChange}
              isUpdating={isUpdatingPriority}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
