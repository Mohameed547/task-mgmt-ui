import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Paper, Typography, Chip, Stack } from '@mui/material';
import { StatusChip } from '../../../components/StatusChip';
import { DraggableTaskCard } from './DraggableTaskCard';
import type { Task, TaskStatus, UpdateTaskPayload } from '../types/task.types';

export interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTask?: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onError?: (message: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  tasks,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
  const columnId = `column-${status}`;
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
    data: {
      status,
    },
  });

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      data-testid={`task-column-${status.toLowerCase()}`}
      sx={{
        p: 2,
        borderRadius: 2.5,
        backgroundColor: (theme) =>
          isOver
            ? theme.palette.mode === 'dark'
              ? 'rgba(144, 202, 249, 0.08)'
              : 'rgba(25, 118, 210, 0.04)'
            : theme.palette.mode === 'dark'
            ? 'background.paper'
            : '#f8fafc',
        borderColor: isOver ? 'primary.main' : 'divider',
        borderWidth: isOver ? 2 : 1,
        borderStyle: 'solid',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 450,
        height: '100%',
      }}
    >
      {/* Column Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusChip status={status} />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {title}
          </Typography>
        </Stack>

        <Chip
          label={tasks.length}
          size="small"
          color="default"
          variant="outlined"
          sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem' }}
        />
      </Stack>

      {/* Task Cards List / Drop Area */}
      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minHeight: 120,
          }}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <DraggableTaskCard
                key={task._id}
                task={task}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onError={onError}
              />
            ))
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px dashed',
                borderColor: isOver ? 'primary.main' : 'divider',
                borderRadius: 2,
                p: 3,
                minHeight: 120,
                backgroundColor: isOver ? 'action.hover' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic', textAlign: 'center', fontSize: '0.85rem' }}
              >
                Drop tasks here
              </Typography>
            </Box>
          )}
        </Box>
      </SortableContext>
    </Paper>
  );
};
