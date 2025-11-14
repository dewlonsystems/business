// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Alert,
  CircularProgress,
  Divider,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { authAPI } from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        username,
        password
      });

      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirect based on user type
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setError(error.response.data.error || 'Invalid credentials. Please try again.');
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #4a7c59 0%, #7ba08c 100%)',
        padding: { xs: 2, sm: 3, md: 4 },
        position: 'relative'
      }}
    >
      {/* Decorative Elements - Positioned absolutely behind the main content */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 40, 
          right: 40, 
          width: 120, 
          height: 120, 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 40, 
          left: 40, 
          width: 100, 
          height: 100, 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }} 
      />
      
      {/* Main content container */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Paper 
          elevation={6}
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            maxWidth: 450,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            }
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                bgcolor: '#4a7c59', 
                width: 60, 
                height: 60, 
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease-in-out'
                }
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h4" 
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Business Portal
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ opacity: 0.8 }}
            >
              Secure access to your financial dashboard
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  border: '1px solid rgba(255, 0, 0, 0.1)'
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(74, 124, 89, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4a7c59',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4a7c59',
                    borderWidth: 2,
                  },
                }
              }}
              InputLabelProps={{
                sx: {
                  fontWeight: 500,
                }
              }}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                sx: {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(74, 124, 89, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4a7c59',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4a7c59',
                    borderWidth: 2,
                  },
                }
              }}
              InputLabelProps={{
                sx: {
                  fontWeight: 500,
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#4a7c59',
                '&:hover': {
                  backgroundColor: '#3d664b',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
                },
                transition: 'all 0.2s ease-in-out',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Divider sx={{ my: 2, opacity: 0.3 }} />
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Dewlon Systems. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;