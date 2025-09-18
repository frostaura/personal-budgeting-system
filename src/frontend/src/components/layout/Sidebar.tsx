import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
  useTheme,
} from '@mui/material';
import {
  DashboardOutlined,
  AccountBalanceOutlined,
  TrendingUpOutlined,
  TimelineOutlined,
  ScienceOutlined,
  SettingsOutlined,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  width: number;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: DashboardOutlined,
    description: 'Overview of your financial status',
  },
  {
    path: '/accounts',
    label: 'Accounts',
    icon: AccountBalanceOutlined,
    description: 'Manage your financial accounts',
  },
  {
    path: '/cashflows',
    label: 'Cash Flows',
    icon: TrendingUpOutlined,
    description: 'Income and expenses',
  },
  {
    path: '/projections',
    label: 'Projections',
    icon: TimelineOutlined,
    description: 'Future financial projections',
  },
  {
    path: '/scenarios',
    label: 'Scenarios',
    icon: ScienceOutlined,
    description: 'What-if scenarios',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: SettingsOutlined,
    description: 'Application preferences',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  width,
  variant = 'persistent',
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Plan your financial future
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ pt: 1 }}>
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                aria-label={`Navigate to ${item.label}`}
                role="menuitem"
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'inherit' : 'action.active',
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={
                    variant !== 'temporary' ? item.description : undefined
                  }
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    sx: { mt: 0.5 },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      role="navigation"
      aria-label="Main navigation menu"
    >
      {drawerContent}
    </Drawer>
  );
};
