// src/components/LoadingSpinner.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '200px',
        width: '100%'
      }}
    >
      <CircularProgress 
        size={60} 
        sx={{ 
          mb: 2, 
          color: '#4a7c59',
          animation: 'spin 1.5s linear infinite'
        }}
      />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default LoadingSpinner;