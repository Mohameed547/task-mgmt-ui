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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { TaskStatusSelect } from './TaskStatusSelect';
import { TaskPrioritySelect } from './TaskPrioritySelect';
import { TaskDetailsDialog } from './TaskDetailsDialog';
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    <>
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
        <CardContent sx={{ p: { xs: 1.75, sm: 2 }, '&:last-child': { pb: { xs: 1.75, sm: 2 } } }}>
          {/* Top Header Row: Title (Left) & Due Date Badge (Right) */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
            <Typography
              variant="h6"
              component="h2"
              onClick={() => setIsDetailsOpen(true)}
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.05rem' },
                color: 'text.primary',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                wordBreak: 'break-word',
                flex: 1,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {task.title}
            </Typography>

            {/* Due Date Badge - Top Right */}
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                flexShrink: 0,
                bgcolor: 'action.hover',
                px: 1,
                py: 0.35,
                borderRadius: 1.5,
                color: 'text.secondary',
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontSize: '0.78125rem', fontWeight: 600 }}>
                {formatDate(task.dueDate)}
              </Typography>
            </Stack>
          </Box>

          {/* Task Description (2 Lines Max with Ellipsis) */}
          {task.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              onClick={() => setIsDetailsOpen(true)}
              sx={{
                mt: 1,
                mb: 1,
                fontSize: '0.85rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Task Attachment Badge / Link */}
          {task.attachment && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <Box
                component="a"
                href={task.attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                data-testid={`task-attachment-link-${task._id}`}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  maxWidth: '100%',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'action.selected' : 'primary.50'),
                  color: 'primary.main',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1.5,
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    textDecoration: 'underline',
                  },
                }}
              >
                <AttachFileIcon sx={{ fontSize: 16 }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'inherit',
                  }}
                >
                  {task.attachment.fileName}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1.25, borderColor: 'divider' }} />

          {/* Footer / Controls Row: Inline Status & Inline Priority (Side-by-Side 50/50 Grid) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
              alignItems: 'center',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, fontWeight: 500, fontSize: '0.75rem' }}>
                Status
              </Typography>
              <TaskStatusSelect
                status={currentStatus}
                onChange={handleStatusChange}
                isUpdating={isUpdatingStatus}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25, fontWeight: 500, fontSize: '0.75rem' }}>
                Priority
              </Typography>
              <TaskPrioritySelect
                priority={currentPriority}
                onChange={handlePriorityChange}
                isUpdating={isUpdatingPriority}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Task Details Popup Dialog */}
      <TaskDetailsDialog
        task={task}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onUpdateTask={onUpdateTask}
        onError={onError}
      />
    </>
  );
};
