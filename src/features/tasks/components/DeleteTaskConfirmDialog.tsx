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
  Alert,
} from '@mui/material';

export interface DeleteTaskConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
  isDeleting?: boolean;
  errorMessage?: string;
}

export const DeleteTaskConfirmDialog: React.FC<DeleteTaskConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  taskTitle = 'this task',
  isDeleting = false,
  errorMessage,
}) => {
  const handleConfirm = () => {
    if (isDeleting) return; // Prevent duplicate deletion attempts
    onConfirm();
  };

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
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <DialogContentText id="delete-task-dialog-description">
          Are you sure you want to delete <strong>"{taskTitle}"</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isDeleting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
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
