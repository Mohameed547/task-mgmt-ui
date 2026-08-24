import React from 'react';
import { Chip, useTheme, type ChipProps } from '@mui/material';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Autorenew from '@mui/icons-material/Autorenew';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import { type TaskStatus, STATUS_CONFIG } from '../theme/statusPriority';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: TaskStatus | string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small', sx, ...props }) => {
  const theme = useTheme();
  const normalizedStatus = (status.toUpperCase().replace(/\s+/g, '_') as TaskStatus);
  const config = STATUS_CONFIG[normalizedStatus] || {
    label: status,
    color: 'default',
    bgLight: '#e2e8f0',
    bgDark: '#334155',
    textColorLight: '#475569',
    textColorDark: '#cbd5e1',
  };

  const getIcon = () => {
    switch (normalizedStatus) {
      case 'TODO':
        return <RadioButtonUnchecked sx={{ fontSize: '14px !important' }} />;
      case 'IN_PROGRESS':
        return <Autorenew sx={{ fontSize: '14px !important' }} />;
      case 'DONE':
        return <CheckCircleOutlined sx={{ fontSize: '14px !important' }} />;
      default:
        return undefined;
    }
  };

  const backgroundColor = theme.palette.mode === 'dark' ? config.bgDark : config.bgLight;
  const textColor = theme.palette.mode === 'dark' ? config.textColorDark : config.textColorLight;

  return (
    <Chip
      icon={getIcon()}
      label={config.label}
      size={size}
      aria-label={`Status: ${config.label}`}
      sx={{
        backgroundColor,
        color: textColor,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: textColor,
        },
        ...sx,
      }}
      {...props}
    />
  );
};
