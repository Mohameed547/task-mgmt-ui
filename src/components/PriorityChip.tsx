import React from 'react';
import { Chip, type ChipProps } from '@mui/material';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Remove from '@mui/icons-material/Remove';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { type TaskPriority, PRIORITY_CONFIG } from '../theme/statusPriority';

export interface PriorityChipProps extends Omit<ChipProps, 'color'> {
  priority: TaskPriority | string;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority, size = 'small', sx, ...props }) => {
  const normalizedPriority = (priority.toUpperCase() as TaskPriority);
  const config = PRIORITY_CONFIG[normalizedPriority] || {
    label: priority,
    color: 'default' as const,
    iconType: 'medium' as const,
  };

  const getIcon = () => {
    switch (config.iconType) {
      case 'low':
        return <KeyboardArrowDown sx={{ fontSize: '16px !important' }} />;
      case 'medium':
        return <Remove sx={{ fontSize: '14px !important' }} />;
      case 'high':
        return <KeyboardArrowUp sx={{ fontSize: '16px !important' }} />;
      default:
        return undefined;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
      aria-label={`Priority: ${config.label}`}
      sx={{
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    />
  );
};
