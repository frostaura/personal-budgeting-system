import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  MenuOutlined,
  AccountBalanceWalletOutlined,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebar, setSidebarOpen } from '@/store/slices/appSlice';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(state => state.app.sidebarOpen);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleCloseSidebar = () => {
    dispatch(setSidebarOpen(false));
  };

  const drawerWidth = 280;

  return (
    <Box sx={{ 
      display: 'flex', 
      // Use dynamic viewport height for mobile devices
      minHeight: ['100vh', '100dvh'], // dvh is dynamic viewport height
      '@supports (height: 100dvh)': {
        minHeight: '100dvh',
      },
    }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle navigation menu"
            edge="start"
            onClick={handleToggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuOutlined />
          </IconButton>

          <AccountBalanceWalletOutlined sx={{ mr: 2, color: 'primary.main' }} />

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Personal Finance Planner
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar
        open={sidebarOpen}
        onClose={isMobile ? handleCloseSidebar : handleToggleSidebar}
        width={drawerWidth}
        variant={isMobile ? 'temporary' : 'persistent'}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: `${theme.mixins.toolbar.minHeight}px`,
          height: '100vh',
          // Use dynamic viewport height for mobile devices
          '@supports (height: 100dvh)': {
            height: '100dvh',
          },
          overflow: 'auto',
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen &&
            !isMobile && {
              marginLeft: `${drawerWidth}px`,
              transition: theme.transitions.create(['margin'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }),
        }}
      >
        <Box sx={{ 
          minHeight: 'calc(100% - 64px)', // Account for app bar height
          pb: 2, // Add some bottom padding
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
