import React from 'react';
import { Box } from '@mui/material';
import { TaskBoard } from './TaskBoard';
import type { Task, UpdateTaskPayload } from '../types/task.types';

export interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTask?: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onError?: (message: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
  return (
    <Box data-testid="task-list-container" sx={{ width: '100%' }}>
      <TaskBoard
        tasks={tasks}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onUpdateTask={onUpdateTask}
        onError={onError}
      />
    </Box>
  );
};
