// src/components/PaymentStatus.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { Close as CloseIcon } from '@mui/icons-material';

const PaymentStatus = () => {
  const { referenceId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusCheckCount, setStatusCheckCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setLoading(true);

        // Step 1: Verify payment with backend
        await paymentAPI.verifyPayment(referenceId);

        // Step 2: Fetch the updated payment status
        const response = await paymentAPI.getPaymentStatus(referenceId);
        setPayment(response.data);

        // Step 3: If still processing, set up polling
        if (response.data.status === 'processing' || response.data.status === 'initiated') {
          if (statusCheckCount < 10) { // Max 10 polling attempts
            setTimeout(() => {
              setStatusCheckCount(prev => prev + 1);
              fetchPaymentStatus();
            }, 3000); // Check every 3 seconds
          }
        }
      } catch (err) {
        setError('Failed to fetch payment status');
        console.error('Error fetching payment status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [referenceId, statusCheckCount]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'default';
      case 'timeout':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'success':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'pending':
        return 'Payment is pending approval.';
      case 'processing':
        return 'Payment is being processed. Please wait...';
      case 'cancelled':
        return 'Payment was cancelled.';
      case 'timeout':
        return 'Payment timed out. Please try again.';
      default:
        return 'Payment status unknown.';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2, color: '#4a7c59' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Checking payment status...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your payment status.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/payments')}
            sx={{ backgroundColor: '#4a7c59', mt: 2 }}
          >
            Back to Payments
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#4a7c59' }}>
            Payment Status
          </Typography>
          <IconButton onClick={() => navigate('/')} sx={{ color: '#4a7c59' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} textAlign="center">
            <Chip 
              label={payment?.status.toUpperCase()} 
              color={getStatusColor(payment?.status)} 
              size="large"
              sx={{ 
                height: 48,
                fontSize: '1rem',
                fontWeight: 'bold',
                mb: 2
              }}
            />
          </Grid>
          
          <Grid item xs={12} textAlign="center">
            <Typography variant="h6" gutterBottom>
              {getStatusMessage(payment?.status)}
            </Typography>
          </Grid>
          
          {payment && (
            <Grid item xs={12}>
              <Box sx={{ 
                backgroundColor: 'rgba(74, 124, 89, 0.05)', 
                p: 2, 
                borderRadius: 2,
                mb: 2
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Reference ID: {payment.reference_id}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Amount: KSH {payment.amount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {payment.phone_number}
                </Typography>
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} textAlign="center">
            <Button 
              variant="contained" 
              onClick={() => navigate('/payments')}
              sx={{ 
                backgroundColor: '#4a7c59',
                mr: 1
              }}
            >
              View All Payments
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              sx={{ 
                color: '#4a7c59', 
                borderColor: '#4a7c59',
                ml: 1
              }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PaymentStatus;
