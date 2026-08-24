import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import AddIcon from '@mui/icons-material/Add';

export interface EmptyStateProps {
  type?: 'empty' | 'no-results';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  const isNoResults = type === 'no-results';

  const defaultTitle = isNoResults
    ? 'No tasks match your filters'
    : 'No tasks in your workspace yet';

  const defaultDescription = isNoResults
    ? 'Try adjusting your search query, status, or priority filters.'
    : 'Organize your workflow, track priorities, and collaborate efficiently by creating your first task.';

  const defaultActionText = isNoResults ? 'Clear All Filters' : 'Create First Task';

  const defaultIcon = isNoResults ? (
    <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
  ) : (
    <AssignmentIcon sx={{ fontSize: 52, color: 'primary.main', opacity: 0.8 }} />
  );

  return (
    <Paper
      data-testid={isNoResults ? 'ux-no-results-state' : 'ux-empty-state'}
      elevation={1}
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
      {icon || defaultIcon}
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title || defaultTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
        {description || defaultDescription}
      </Typography>
      {onAction && (
        <Button
          variant={isNoResults ? 'outlined' : 'contained'}
          color={isNoResults ? 'secondary' : 'primary'}
          startIcon={!isNoResults ? <AddIcon /> : undefined}
          onClick={onAction}
          sx={{ mt: 1, fontWeight: 600, textTransform: 'none' }}
        >
          {actionText || defaultActionText}
        </Button>
      )}
    </Paper>
  );
};
