import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';
import { TaskCard, type TaskCardProps } from './TaskCard';
import type { Task } from '../types/task.types';

export interface DraggableTaskCardProps extends Omit<TaskCardProps, 'task'> {
  task: Task;
}

export const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      task,
      status: task.status,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`draggable-task-card-${task._id}`}
      sx={{
        position: 'relative',
        userSelect: 'none',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <TaskCard
        task={task}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onUpdateTask={onUpdateTask}
        onError={onError}
      />
    </Box>
  );
};
