// src/components/PaymentRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { paymentAPI } from '../services/api';

const PaymentRedirect = () => {
  const navigate = useNavigate();
  const { referenceId } = useParams();

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const response = await paymentAPI.initiatePayment({
          phone_number: '+254700000000', // This would come from form data
          amount: 1000, // This would come from form data
          description: 'Test Payment',
          payment_method: 'paystack'
        });

        if (response.data.authorization_url) {
          // Redirect to Paystack payment page
          window.location.href = response.data.authorization_url;
        } else {
          navigate('/payments');
        }
      } catch (error) {
        console.error('Payment initiation error:', error);
        navigate('/payment');
      }
    };

    initiatePayment();
  }, [navigate]);

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
        Redirecting to payment page...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Please wait while we redirect you to complete your payment.
      </Typography>
    </Box>
  );
};

export default PaymentRedirect;