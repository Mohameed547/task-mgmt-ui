import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { TaskForm } from './TaskForm';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload) => Promise<void> | void;
  initialValues?: Task | null;
  isSubmitting?: boolean;
  apiErrorMessage?: string;
}

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
  apiErrorMessage,
}) => {
  const isEditing = Boolean(initialValues);

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
      <DialogContent dividers>
        <TaskForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          apiErrorMessage={apiErrorMessage}
        />
      </DialogContent>
    </Dialog>
  );
};
