import React, { useState } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  InputAdornment,
  Avatar,
  Stack,
} from '@mui/material';
import Assignment from '@mui/icons-material/Assignment';
import Autorenew from '@mui/icons-material/Autorenew';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { MainLayout } from '../layouts/MainLayout';
import { StatusChip } from '../components/StatusChip';
import { PriorityChip } from '../components/PriorityChip';
import { LoginPage, RegisterPage, ProtectedRoute, PublicOnlyRoute } from '../features/auth';
import type { TaskStatus, TaskPriority } from '../theme/statusPriority';

interface SampleTask {
  id: string;
  key: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

const SAMPLE_TASKS: SampleTask[] = [
  {
    id: '1',
    key: 'TM-101',
    title: 'Configure Material UI theme and global styling tokens',
    status: 'DONE',
    priority: 'HIGH',
    assignee: 'John Doe',
    dueDate: '2026-08-25',
  },
  {
    id: '2',
    key: 'TM-102',
    title: 'Implement user authentication login and registration forms',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    assignee: 'Jane Smith',
    dueDate: '2026-08-27',
  },
  {
    id: '3',
    key: 'TM-103',
    title: 'Integrate TanStack Query for caching and API fetching',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignee: 'John Doe',
    dueDate: '2026-08-28',
  },
  {
    id: '4',
    key: 'TM-104',
    title: 'Add responsive drawer navigation and breadcrumbs',
    status: 'TODO',
    priority: 'LOW',
    assignee: 'Alex Rivera',
    dueDate: '2026-08-30',
  },
];

const HomePage: React.FC = () => (
  <Box>
    {/* Page Header */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Workspace Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track project health, task progress, and upcoming deliverables.
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        component={RouterLink}
        to="/tasks"
      >
        Create Task
      </Button>
    </Box>

    {/* Metric Cards Grid */}
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ p: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                TOTAL TASKS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
                12
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'action.selected', color: 'primary.main', width: 44, height: 44 }}>
              <Assignment />
            </Avatar>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ p: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                IN PROGRESS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'info.main' }}>
                5
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'info.lighter', color: 'info.main', width: 44, height: 44 }}>
              <Autorenew />
            </Avatar>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ p: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                COMPLETED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'success.main' }}>
                4
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 44, height: 44 }}>
              <CheckCircle />
            </Avatar>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card sx={{ p: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                HIGH PRIORITY
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'error.main' }}>
                3
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'error.lighter', color: 'error.main', width: 44, height: 44 }}>
              <Warning />
            </Avatar>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Recent Tasks Summary Table */}
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Recent Workspace Activity
      </Typography>
      <TableContainer>
        <Table aria-label="recent tasks table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Key</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Task Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SAMPLE_TASKS.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{task.key}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <StatusChip status={task.status} />
                </TableCell>
                <TableCell>
                  <PriorityChip priority={task.priority} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{task.assignee.charAt(0)}</Avatar>
                    <Typography variant="body2">{task.assignee}</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Box>
);

const TasksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const filteredTasks = SAMPLE_TASKS.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Tasks Board
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage, filter, and track tasks across team workflows.
        </Typography>
      </Box>

      {/* Filter Toolbar */}
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title or key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
                htmlInput: {
                  'aria-label': 'Filter tasks by title or key',
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                htmlInput: {
                  'aria-label': 'Filter by Status',
                },
              }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              slotProps={{
                htmlInput: {
                  'aria-label': 'Filter by Priority',
                },
              }}
            >
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table aria-label="tasks board table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Key</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assignee</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{task.key}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{task.title}</TableCell>
                  <TableCell>
                    <StatusChip status={task.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityChip priority={task.priority} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{task.assignee.charAt(0)}</Avatar>
                      <Typography variant="body2">{task.assignee}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No tasks match the selected filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const ProjectsPage: React.FC = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
      Projects Overview
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Project management board ready for feature integration.
    </Typography>
  </Paper>
);

const SettingsPage: React.FC = () => (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
      Workspace Settings
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Configure your workspace team members, preferences, and integrations.
    </Typography>
  </Paper>
);

const NotFoundPage: React.FC = () => (
  <Paper sx={{ p: 4, textAlign: 'center' }}>
    <Typography variant="h3" color="error" gutterBottom>
      404 - Page Not Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
      The page you are looking for does not exist.
    </Typography>
    <Button variant="contained" component={RouterLink} to="/">
      Back to Dashboard
    </Button>
  </Paper>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public-Only Routes (Redirect authenticated users to home/dashboard) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Workspace Routes (Redirect unauthenticated users to /login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
