import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';

export interface DeleteTaskConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
  isDeleting?: boolean;
}

export const DeleteTaskConfirmDialog: React.FC<DeleteTaskConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  taskTitle = 'this task',
  isDeleting = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      aria-labelledby="delete-task-dialog-title"
      aria-describedby="delete-task-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="delete-task-dialog-title" sx={{ fontWeight: 700, color: 'error.main' }}>
        Confirm Task Deletion
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-task-dialog-description">
          Are you sure you want to delete <strong>"{taskTitle}"</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isDeleting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          sx={{ fontWeight: 600 }}
        >
          {isDeleting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Deleting...</span>
            </Box>
          ) : (
            'Delete Task'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
