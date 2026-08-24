import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Skeleton } from '@mui/material';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 5 }) => {
  return (
    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
      <Table aria-label="loading data table">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            {Array.from({ length: columns }).map((_, idx) => (
              <TableCell key={idx}>
                <Skeleton variant="text" width={idx === 0 ? 140 : 80} height={24} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx} sx={{ py: 2 }}>
                  <Skeleton
                    variant={colIdx === 1 || colIdx === 2 ? 'rounded' : 'text'}
                    width={colIdx === 0 ? '80%' : colIdx === 1 || colIdx === 2 ? 80 : 100}
                    height={colIdx === 1 || colIdx === 2 ? 24 : 20}
                    sx={{ borderRadius: colIdx === 1 || colIdx === 2 ? 3 : 1 }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
