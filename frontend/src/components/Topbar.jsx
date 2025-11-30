// src/components/Topbar.jsx
import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuItem, 
  Box,
  useTheme,
  CircularProgress
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Your authenticated API

const Topbar = ({ isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [totalCollected, setTotalCollected] = useState(null);
  const [loadingTotal, setLoadingTotal] = useState(true);

  // Fetch total collected on mount
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const response = await api.get('/payments/total/');
        setTotalCollected(response.data.total_collected);
      } catch (error) {
        console.error('Failed to fetch total:', error);
        setTotalCollected(0);
      } finally {
        setLoadingTotal(false);
      }
    };

    fetchTotal();
  }, []);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    handleUserMenuClose();
  };

  const user = JSON.parse(localStorage.getItem('user')) || { username: 'User', user_type: 'User' };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => window.dispatchEvent(new CustomEvent('DrawerToggle'))}
            sx={{ mr: 2, color: '#4a7c59' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1, 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 'bold',
            color: '#4a7c59'
          }}
        >
          Business Portal
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* ✅ Total Collected Display */}
          <Box sx={{ mr: 2, textAlign: 'right' }}>
            <Typography 
              variant="body2" 
              sx={{ color: '#666', fontSize: '0.75rem' }}
            >
              Total Collected
            </Typography>
            {loadingTotal ? (
              <CircularProgress size={16} sx={{ color: '#4a7c59' }} />
            ) : (
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 'bold', color: '#4a7c59' }}
              >
                KES {totalCollected?.toLocaleString() || '0'}
              </Typography>
            )}
          </Box>

          {/* User Avatar */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="user-account-menu"
            aria-haspopup="true"
            onClick={handleUserMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ bgcolor: '#4a7c59', width: 32, height: 32, fontSize: 14 }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id="user-account-menu"
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2" color="text.secondary">
            {user.username} ({user.user_type})
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Topbar;