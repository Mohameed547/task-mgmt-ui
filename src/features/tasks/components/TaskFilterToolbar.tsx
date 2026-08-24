import React from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import type { TaskStatus, TaskPriority } from '../types/task.types';

export interface TaskFilterToolbarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | 'ALL';
  onStatusChange: (value: TaskStatus | 'ALL') => void;
  priorityFilter: TaskPriority | 'ALL';
  onPriorityChange: (value: TaskPriority | 'ALL') => void;
  onClearFilters: () => void;
  onCreateClick: () => void;
  hasActiveFilters: boolean;
}

export const TaskFilterToolbar: React.FC<TaskFilterToolbarProps> = ({
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  onClearFilters,
  onCreateClick,
  hasActiveFilters,
}) => {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        {/* Search Input */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by task title..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search text"
                      onClick={() => onSearchChange('')}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
              htmlInput: {
                'aria-label': 'Search tasks by title',
              },
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus | 'ALL')}
            slotProps={{
              htmlInput: {
                'aria-label': 'Filter tasks by status',
              },
            }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="TODO">To Do</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
          </TextField>
        </Grid>

        {/* Priority Filter */}
        <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Priority"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'ALL')}
            slotProps={{
              htmlInput: {
                'aria-label': 'Filter tasks by priority',
              },
            }}
          >
            <MenuItem value="ALL">All Priorities</MenuItem>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </TextField>
        </Grid>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Grid size={{ xs: 6, sm: 6, md: 1.5 }}>
            <Tooltip title="Clear search and filters">
              <Button
                fullWidth
                size="medium"
                variant="outlined"
                color="secondary"
                onClick={onClearFilters}
                startIcon={<FilterAltOffIcon fontSize="small" />}
                sx={{ height: 40, textTransform: 'none' }}
              >
                Clear
              </Button>
            </Tooltip>
          </Grid>
        )}

        {/* Create Task Action Button */}
        <Grid size={{ xs: hasActiveFilters ? 6 : 12, sm: hasActiveFilters ? 6 : 12, md: hasActiveFilters ? 1.5 : 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateClick}
              sx={{ height: 40, fontWeight: 600, textTransform: 'none' }}
            >
              Create Task
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
