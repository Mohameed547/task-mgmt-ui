import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert,
  Stack,
  Pagination,
} from '@mui/material';
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
import { LoadingState } from '../../../components/LoadingState';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { getErrorMessage } from '../../../lib/errorUtils';
import type { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

export const TasksPage: React.FC = () => {
  // Pagination & Filter & Search states
  const [page, setPage] = useState(1);
  const limit = 9;

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

  // Reset page to 1 whenever search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  // TanStack Query Data Fetching
  const filterParams = {
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
    page,
    limit,
  };

  const { data, isLoading, isError, error, refetch } = useTasksQuery(filterParams);

  const tasks = data?.tasks || [];
  const pagination = data?.pagination || { page: 1, limit: 9, total: 0, totalPages: 0 };

  // Handle empty page navigation fallback (e.g., after deleting last item on page N)
  useEffect(() => {
    if (data?.pagination && page > data.pagination.totalPages && data.pagination.totalPages > 0) {
      setPage(data.pagination.totalPages);
    }
  }, [data, page]);

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
    setPage(1);
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
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Operation failed. Please try again.');
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
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to delete task.');
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // Inline Update Handler (Status / Priority)
  const handleUpdateTaskInline = async (id: string, payload: UpdateTaskPayload) => {
    try {
      await updateTaskMutation.mutateAsync({ id, payload });
      setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to update task.');
      setSnackbar({ open: true, message: msg, severity: 'error' });
      throw err;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Tasks Board
          </Typography>
          {!isLoading && !isError && (
            <Chip
              label={`${pagination.total} ${pagination.total === 1 ? 'task' : 'tasks'}`}
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
        <Box data-testid="tasks-loading-state">
          <LoadingState message="Loading workspace tasks..." variant="spinner" rows={5} />
        </Box>
      )}

      {/* API Error State */}
      {!isLoading && isError && (
        <Box data-testid="tasks-error-state">
          <ErrorState
            title="Unable to Load Tasks"
            message={error?.message || 'Failed to connect to backend tasks service.'}
            onRetry={() => refetch()}
          />
        </Box>
      )}

      {/* Successful Render & Empty State Checks */}
      {!isLoading && !isError && (
        <>
          {tasks.length > 0 ? (
            <>
              <TaskTable
                tasks={tasks}
                onEditTask={(task) => setEditingTask(task)}
                onDeleteTask={(task) => setDeletingTask(task)}
                onUpdateTask={handleUpdateTaskInline}
                onError={(msg) => setSnackbar({ open: true, message: msg, severity: 'error' })}
              />

              {/* Server-Side Pagination Bar */}
              <Box
                data-testid="tasks-pagination"
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  mb: 2,
                }}
              >
                <Pagination
                  count={Math.max(1, pagination.totalPages)}
                  page={page}
                  onChange={(_e, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  size="medium"
                />
              </Box>
            </>
          ) : hasActiveFilters ? (
            /* No Search / Filter Results State */
            <Box data-testid="tasks-no-results-state">
              <EmptyState
                type="no-results"
                onAction={handleClearFilters}
              />
            </Box>
          ) : (
            /* Empty Task List State (New User) */
            <Box data-testid="tasks-empty-state">
              <EmptyState
                type="empty"
                onAction={() => setIsCreateOpen(true)}
              />
            </Box>
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
