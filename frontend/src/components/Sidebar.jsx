// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  List as ListIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Auto-detect mobile
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false); // Local state for submenu

  const handleMenuToggle = () => {
    setOpenMenu(!openMenu);
  };

  const drawerWidth = 240;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Initiate Payment', icon: <PaymentIcon />, path: '/payment' },
    { text: 'Payment History', icon: <ListIcon />, path: '/payments' },
    { 
      text: 'Receipts', 
      icon: <ReceiptIcon />, 
      path: '/receipts',
      hasSubmenu: true,
      submenu: [
        { text: 'All Receipts', path: '/receipts' },
        { text: 'Generate Receipt', path: '/receipts/generate' },
      ]
    },
  ];

  const drawer = (
    <div>
      {/* Header Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#4a7c59',
            fontSize: '1.2rem'
          }}
        >
          Dewlon Systems
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      
      {/* Menu Items */}
      <List>
        {menuItems.map((item, index) => (
          <div key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  if (item.hasSubmenu) {
                    handleMenuToggle();
                  } else {
                    navigate(item.path);
                    if (isMobile) handleDrawerToggle(); // Close drawer after navigation
                  }
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(74, 124, 89, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(74, 124, 89, 0.2)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(74, 124, 89, 0.05)',
                  },
                  borderRadius: 1,
                  margin: 0.5,
                }}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? '#4a7c59' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    }
                  }}
                />
                {item.hasSubmenu && (openMenu ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>
            {item.hasSubmenu && (
              <Collapse in={openMenu} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      sx={{ pl: 4 }}
                      onClick={() => {
                        navigate(subItem.path);
                        if (isMobile) handleDrawerToggle(); // Close drawer after navigation
                      }}
                    >
                      <ListItemText primary={subItem.text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>
      
      {/* Footer */}
      <Divider sx={{ mt: 'auto', mb: 2 }} />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Dewlon Systems
        </Typography>
      </Box>
    </div>
  );

  return (
    <>
      {/* Hamburger Button for Mobile */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            mr: 2, 
            display: { md: 'none' }, 
            position: 'fixed',        
            top: 8,
            left: 8,
            zIndex: 1300,           
            backgroundColor: '#4a7c59',
            '&:hover': {
              backgroundColor: '#3d664b',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {/* Desktop Permanent Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              top: '64px', 
              height: 'calc(100vh - 64px)', 
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      {/* Mobile Temporary Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              top: '56px', 
              height: 'calc(100vh - 56px)', 
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;