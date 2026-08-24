import React, { useState } from 'react';
import {
  Box,
  Menu,
  MenuItem,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import { StatusChip } from '../../../components/StatusChip';
import { STATUS_CONFIG, type TaskStatus } from '../../../theme/statusPriority';

export interface TaskStatusSelectProps {
  status: TaskStatus | string;
  onChange: (newStatus: TaskStatus) => void | Promise<void>;
  isUpdating?: boolean;
  disabled?: boolean;
}

const STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export const TaskStatusSelect: React.FC<TaskStatusSelectProps> = ({
  status,
  onChange,
  isUpdating = false,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const normalizedStatus = (status.toUpperCase().replace(/\s+/g, '_') as TaskStatus);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled || isUpdating) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedStatus: TaskStatus) => {
    handleClose();
    if (selectedStatus !== normalizedStatus) {
      onChange(selectedStatus);
    }
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Box
        component="button"
        type="button"
        onClick={handleClick}
        disabled={disabled || isUpdating}
        aria-label={`Change status for task. Current status: ${STATUS_CONFIG[normalizedStatus]?.label || status}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        sx={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled || isUpdating ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 1.5,
          transition: 'opacity 0.2s ease, transform 0.1s ease',
          '&:hover': {
            opacity: disabled || isUpdating ? 1 : 0.85,
          },
          '&:focus-visible': {
            outline: '2px solid primary.main',
            outlineOffset: '2px',
          },
        }}
      >
        <StatusChip status={normalizedStatus} />
        {isUpdating ? (
          <CircularProgress
            size={14}
            color="inherit"
            sx={{ ml: 0.75 }}
            aria-label="Updating status..."
          />
        ) : (
          <ArrowDropDownIcon
            sx={{
              fontSize: 18,
              ml: 0.25,
              color: 'text.secondary',
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-label': 'Select task status',
          role: 'listbox',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 160,
            borderRadius: 2,
            mt: 0.5,
          },
        }}
      >
        {STATUS_OPTIONS.map((optionKey) => {
          const isSelected = optionKey === normalizedStatus;
          return (
            <MenuItem
              key={optionKey}
              role="option"
              selected={isSelected}
              onClick={() => handleSelect(optionKey)}
              aria-selected={isSelected}
              sx={{ py: 1, px: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {isSelected && <CheckIcon fontSize="small" color="primary" />}
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500 }}>
                  {STATUS_CONFIG[optionKey]?.label || optionKey}
                </Typography>
              </ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};
