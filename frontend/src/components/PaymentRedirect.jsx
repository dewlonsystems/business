// src/components/PaymentRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { paymentAPI } from '../services/api';

const PaymentRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPayment = async () => {
      // Get 'reference' query param from Paystack
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference'); // or trxref

      if (!reference) {
        console.error('No payment reference found in URL');
        navigate('/payments'); // fallback
        return;
      }

      try {
        // Verify payment using backend API
        const response = await paymentAPI.verifyPayment(reference);

        if (response.data.status === 'success') {
          // Payment successful
          navigate(`/payment-status/${reference}?status=success`);
        } else {
          // Payment failed or pending
          navigate(`/payment-status/${reference}?status=failed`);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        navigate(`/payment-status/${reference}?status=error`);
      }
    };

    checkPayment();
  }, [location, navigate]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center'
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2, color: '#4a7c59' }} />
      <Typography variant="h6" color="text.secondary">
        Checking your payment status...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Please wait while we confirm your payment.
      </Typography>
    </Box>
  );
};

export default PaymentRedirect;
