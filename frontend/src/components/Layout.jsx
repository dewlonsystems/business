// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  CssBaseline, 
  Toolbar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Topbar isMobile={isMobile} />
      <Sidebar isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px', // Account for topbar height
          marginLeft: isMobile ? 0 : '240px', // Account for sidebar width
          transition: theme.transitions.create(['margin', 'padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Toolbar /> {/* This ensures content doesn't go under topbar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;