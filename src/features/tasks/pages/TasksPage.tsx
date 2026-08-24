import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AddIcon from '@mui/icons-material/Add';
import {
  useTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../hooks/useTaskQueries';
import { TaskFilterToolbar } from '../components/TaskFilterToolbar';
import { TaskTable } from '../components/TaskTable';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { DeleteTaskConfirmDialog } from '../components/DeleteTaskConfirmDialog';
import type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export const TasksPage: React.FC = () => {
  // Filter & Search states
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // TanStack Query Data Fetching
  const filterParams = {
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
  };

  const { data: tasks = [], isLoading, isError, error, refetch } = useTasksQuery(filterParams);

  // TanStack Query Mutations
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const deleteTaskMutation = useDeleteTaskMutation();

  // Dialog & Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Feedback Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const hasActiveFilters = Boolean(
    searchInput.trim() || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
  );

  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  // Form Submission Handler (Create or Edit)
  const handleFormSubmit = async (payload: CreateTaskPayload | UpdateTaskPayload) => {
    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({
          id: editingTask._id,
          payload: payload as UpdateTaskPayload,
        });
        setEditingTask(null);
        setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
      } else {
        await createTaskMutation.mutateAsync(payload as CreateTaskPayload);
        setIsCreateOpen(false);
        setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      }
    } catch (err: any) {
      const msg = err?.message || 'Operation failed. Please try again.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      await deleteTaskMutation.mutateAsync(deletingTask._id);
      setDeletingTask(null);
      setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' });
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete task.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Tasks Board
          </Typography>
          {!isLoading && !isError && (
            <Chip
              label={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
          )}
        </Stack>
      </Box>

      {/* Search & Filter Toolbar */}
      <TaskFilterToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        onClearFilters={handleClearFilters}
        onCreateClick={() => setIsCreateOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Initial Loading State */}
      {isLoading && (
        <Paper
          data-testid="tasks-loading-state"
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            gap: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
            Loading workspace tasks...
          </Typography>
        </Paper>
      )}

      {/* API Error State */}
      {!isLoading && isError && (
        <Paper data-testid="tasks-error-state" sx={{ p: 4, borderRadius: 2 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()} startIcon={<RefreshIcon />}>
                Retry
              </Button>
            }
          >
            {error?.message || 'Failed to load tasks from server.'}
          </Alert>
        </Paper>
      )}

      {/* Successful Render & Empty State Checks */}
      {!isLoading && !isError && (
        <>
          {tasks.length > 0 ? (
            <TaskTable
              tasks={tasks}
              onEditTask={(task) => setEditingTask(task)}
              onDeleteTask={(task) => setDeletingTask(task)}
            />
          ) : hasActiveFilters ? (
            /* No Search / Filter Results State */
            <Paper
              data-testid="tasks-no-results-state"
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No tasks match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search query, status, or priority filters.
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClearFilters}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Clear All Filters
              </Button>
            </Paper>
          ) : (
            /* Empty Task List State (New User) */
            <Paper
              data-testid="tasks-empty-state"
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <AssignmentIcon sx={{ fontSize: 52, color: 'primary.main', opacity: 0.8 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No tasks in your workspace yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                Organize your workflow, track priorities, and collaborate efficiently by creating your first task.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateOpen(true)}
                sx={{ mt: 1, fontWeight: 600, textTransform: 'none' }}
              >
                Create First Task
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Create Task Form Dialog */}
      <TaskFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={createTaskMutation.isPending}
      />

      {/* Edit Task Form Dialog */}
      <TaskFormDialog
        open={Boolean(editingTask)}
        initialValues={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleFormSubmit}
        isSubmitting={updateTaskMutation.isPending}
      />

      {/* Delete Task Confirmation Dialog */}
      <DeleteTaskConfirmDialog
        open={Boolean(deletingTask)}
        taskTitle={deletingTask?.title}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteTaskMutation.isPending}
      />

      {/* Operation Feedback Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
