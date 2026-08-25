import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, Grid } from '@mui/material';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { getErrorMessage } from '../../../lib/errorUtils';
import type { Task, TaskStatus, UpdateTaskPayload } from '../types/task.types';

export interface TaskBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTask?: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onError?: (message: string) => void;
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To Do' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'DONE', title: 'Done' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
  onError,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    tasks.forEach((task) => {
      const normalized = (task.status.toUpperCase().replace(/\s+/g, '_') as TaskStatus);
      if (grouped[normalized]) {
        grouped[normalized].push(task);
      } else {
        grouped.TODO.push(task);
      }
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    const draggedTask = tasks.find((t) => t._id === activeTaskId);
    if (!draggedTask) return;

    let targetStatus: TaskStatus | null = null;

    if (overId.startsWith('column-')) {
      targetStatus = overId.replace('column-', '') as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        targetStatus = (overTask.status.toUpperCase().replace(/\s+/g, '_') as TaskStatus);
      }
    }

    if (!targetStatus) return;

    const currentStatus = (draggedTask.status.toUpperCase().replace(/\s+/g, '_') as TaskStatus);

    // Prevent unnecessary API calls if dropped in the same status
    if (currentStatus === targetStatus) {
      return;
    }

    // Trigger update request
    if (onUpdateTask) {
      try {
        await onUpdateTask(draggedTask._id, { status: targetStatus });
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err, 'Failed to update task status via drag and drop.');
        if (onError) {
          onError(errorMsg);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        data-testid="task-board"
        sx={{
          width: '100%',
        }}
      >
        <Grid
          container
          spacing={2.5}
          sx={{
            width: '100%',
            alignItems: 'stretch',
          }}
        >
          {COLUMNS.map(({ status, title }) => (
            <Grid key={status} size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TaskColumn
                status={status}
                title={title}
                tasks={tasksByStatus[status] || []}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onError={onError}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Drag Overlay for active dragged card */}
      <DragOverlay>
        {activeTask ? (
          <Box sx={{ opacity: 0.9, transform: 'scale(1.02)', cursor: 'grabbing' }}>
            <TaskCard
              task={activeTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
