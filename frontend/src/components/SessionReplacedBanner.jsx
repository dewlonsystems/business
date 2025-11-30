// src/components/SessionReplacedBanner.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SessionReplacedBanner = () => {
  const [countdown, setCountdown] = useState(5);
  const [isVisible, setIsVisible] = useState(true); // ✅ Control visibility
  const navigate = useNavigate();

  const handleNavigateToLogin = useCallback(() => {
    if (!isVisible) return; // Prevent double navigation
    setIsVisible(false); // ✅ Hide banner immediately
    // Small delay to ensure UI update before redirect
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 100);
  }, [isVisible, navigate]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNavigateToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, handleNavigateToLogin]);

  if (!isVisible) return null; // ✅ Don't render if hidden

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Alert
        severity="error"
        sx={{
          width: { xs: '90%', sm: '500px' },
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(5 - countdown) * 20}
            sx={{ height: 6, borderRadius: 3, mb: 1 }}
          />
          <Typography variant="body2" align="right" color="textSecondary">
            Redirecting in {countdown}s...
          </Typography>
        </Box>

        <AlertTitle>Session Replaced</AlertTitle>
        <Typography variant="body1" gutterBottom>
          Your session was ended because you logged in from another device or browser.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={handleNavigateToLogin}
          sx={{ mt: 2 }}
          fullWidth
        >
          Log in Again
        </Button>
      </Alert>
    </Box>
  );
};

export default SessionReplacedBanner;