// src/components/Layout.jsx
import React, { useState } from 'react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle mobile sidebar toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Calculate sidebar width based on mobile state
  const sidebarWidth = isMobile ? 0 : 240; // 0 when mobile sidebar is closed

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Topbar isMobile={isMobile} />
      <Sidebar 
        isMobile={isMobile} 
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: '64px', // Account for topbar height
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`, // Dynamic margin
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          minHeight: 'calc(100vh - 64px)',
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`, // Prevent horizontal scroll
        }}
      >
        <Toolbar /> {/* This ensures content doesn't go under topbar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;