import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { StatusChip } from '../../../components/StatusChip';
import { PriorityChip } from '../../../components/PriorityChip';
import type { Task } from '../types/task.types';

export interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onEditTask, onDeleteTask }) => {
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

  return (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
      <Table aria-label="tasks management table">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Title & Description</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1.8, width: 140 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1.8, width: 120 }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: 700, py: 1.8, width: 150 }}>Due Date</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, py: 1.8, width: 120 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task._id}
              hover
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                transition: 'background-color 0.15s ease-in-out',
              }}
            >
              {/* Title & Description */}
              <TableCell sx={{ py: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.8125rem',
                      }}
                    >
                      {task.description}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell sx={{ py: 2 }}>
                <StatusChip status={task.status} />
              </TableCell>

              {/* Priority */}
              <TableCell sx={{ py: 2 }}>
                <PriorityChip priority={task.priority} />
              </TableCell>

              {/* Due Date */}
              <TableCell sx={{ py: 2 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" color="text.secondary">
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                    {formatDate(task.dueDate)}
                  </Typography>
                </Stack>
              </TableCell>

              {/* Actions */}
              <TableCell align="right" sx={{ py: 2 }}>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
