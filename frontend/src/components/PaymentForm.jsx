// src/components/PaymentForm.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  PhoneAndroid as PhoneIcon,
  CreditCard as CreditCardIcon,
  LocalAtm as LocalAtmIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    phone_number: '',
    amount: '',
    description: '',
    payment_method: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const [mpesaResult, setMpesaResult] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone_number') {
      // Only allow numeric input for phone number
      const numericValue = value.replace(/[^0-9]/g, '');
      // Limit to 9 digits after +254 prefix
      setFormData({
        ...formData,
        [name]: numericValue.slice(0, 9)
      });
    } else if (name === 'amount') {
      // Only allow numeric input for amount (including decimal point)
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        // Keep only the first decimal point
        const correctedValue = parts[0] + '.' + parts.slice(1).join('');
        setFormData({
          ...formData,
          [name]: correctedValue
        });
      } else {
        setFormData({
          ...formData,
          [name]: numericValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.payment_method) {
      setError('Please select a payment method');
      setLoading(false);
      return;
    }

    if (!formData.phone_number || formData.phone_number.length < 9) {
      setError('Phone number must be 9 digits (e.g., 712345678)');
      setLoading(false);
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount is required and must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const response = await paymentAPI.initiatePayment({
        ...formData,
        phone_number: `254${formData.phone_number}`
      });
      
      if (formData.payment_method === 'mpesa') {
        // For Mpesa, show a dialog to inform the user
        setMpesaResult(response.data);
        setShowMpesaDialog(true);
        
        // Update success message for Mpesa
        setSuccess('Mpesa payment initiated! Check your phone for the payment prompt.');
      } else if (response.data.authorization_url && formData.payment_method === 'paystack') {
        // For Paystack, redirect to the authorization URL
        window.location.href = response.data.authorization_url;
        return; // Don't navigate to payments page
      } else {
        setSuccess('Payment initiated successfully!');
        setTimeout(() => {
          navigate('/payments');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initiate payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaDialogClose = () => {
    setShowMpesaDialog(false);
    setFormData({
      phone_number: '',
      amount: '',
      description: '',
      payment_method: ''
    });
    // Don't navigate immediately, let user see the success message
  };

  const handleMethodChange = (method) => {
    setFormData({
      ...formData,
      payment_method: method,
      phone_number: '' // Clear phone number when changing method
    });
    setError('');
    setSuccess('');
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'mpesa':
        return <LocalAtmIcon />;
      case 'paystack':
        return <CreditCardIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        mt: 4, 
        mb: 4,
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Fixed Header Section - No Horizontal Scroll */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
        justifyContent: 'space-between', 
        alignItems: 'flex-start', // Align to top instead of center
        mb: 4,
        gap: 2 // Add gap between elements
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: '#333',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' }, // Smaller font sizes
            mb: { xs: 1, sm: 0 } // Add margin bottom on mobile to separate from button
          }}
        >
          Initiate Payment
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          sx={{ 
            color: '#4a7c59', 
            borderColor: '#4a7c59',
            textTransform: 'none',
            fontWeight: 600,
            px: 2, // Reduced padding
            py: 1,
            minWidth: 'auto', // Allow button to shrink
            '&:hover': {
              backgroundColor: 'rgba(74, 124, 89, 0.1)',
              borderColor: '#3d664b'
            }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Paper 
        elevation={6}
        sx={{ 
          p: 4, 
          borderRadius: 3,
          border: '1px solid rgba(74, 124, 89, 0.1)',
          backgroundColor: 'rgba(74, 124, 89, 0.02)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Payment Method Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#4a7c59', fontWeight: 600, mb: 2 }}>
              Select Payment Method
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card 
                  onClick={() => handleMethodChange('mpesa')}
                  sx={{ 
                    cursor: 'pointer',
                    border: formData.payment_method === 'mpesa' ? '2px solid #4a7c59' : '1px solid #e0e0e0',
                    backgroundColor: formData.payment_method === 'mpesa' ? 'rgba(74, 124, 89, 0.1)' : 'white',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(74, 124, 89, 0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: formData.payment_method === 'mpesa' ? '#4a7c59' : 'inherit'
                    }}>
                      <LocalAtmIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Mpesa STK Push
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Direct payment to your phone
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  onClick={() => handleMethodChange('paystack')}
                  sx={{ 
                    cursor: 'pointer',
                    border: formData.payment_method === 'paystack' ? '2px solid #4a7c59' : '1px solid #e0e0e0',
                    backgroundColor: formData.payment_method === 'paystack' ? 'rgba(74, 124, 89, 0.1)' : 'white',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(74, 124, 89, 0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      color: formData.payment_method === 'paystack' ? '#4a7c59' : 'inherit'
                    }}>
                      <CreditCardIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Paystack
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Card, bank, and other methods
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Dynamic Form Fields based on selected method */}
          {formData.payment_method && (
            <Box sx={{ 
              p: 3, 
              borderRadius: 2, 
              backgroundColor: 'white',
              border: '1px solid rgba(74, 124, 89, 0.2)',
              mb: 3
            }}>
              <Typography variant="h6" sx={{ color: '#4a7c59', fontWeight: 600, mb: 3 }}>
                Payment Details
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Amount (KES)"
                    name="amount"
                    type="text" // Changed from number to text to allow custom validation
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 1000"
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                          <Typography variant="body1">KSH</Typography>
                        </Box>
                      ),
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
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    type="text" // Changed from number to text to allow custom validation
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 712345678"
                    helperText="Enter 9-digit phone number (e.g., 712345678). Will be prefixed with +254"
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                          <Typography variant="body1">+254</Typography>
                        </Box>
                      ),
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
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Payment description (optional)"
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
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Submit Button */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 2, // Add gap between buttons on mobile
            mt: 3
          }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setFormData({
                  phone_number: '',
                  amount: '',
                  description: '',
                  payment_method: ''
                });
                setError('');
                setSuccess('');
              }}
              sx={{ 
                color: '#f44336', 
                borderColor: '#f44336',
                textTransform: 'none',
                fontWeight: 600,
                px: 2, // Reduced padding
                py: 1,
                width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  borderColor: '#d32f2f'
                }
              }}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.payment_method || !formData.phone_number || !formData.amount}
              sx={{ 
                backgroundColor: '#4a7c59',
                textTransform: 'none',
                fontWeight: 600,
                px: 3, // Reduced padding
                py: 1.5,
                fontSize: '1rem',
                width: { xs: '100%', sm: 'auto' }, // Full width on mobile
                '&:hover': {
                  backgroundColor: '#3d664b'
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                  color: '#666666'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Initiate Payment'}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Mpesa Success Dialog */}
      <Dialog
        open={showMpesaDialog}
        onClose={handleMpesaDialogClose}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxWidth: 400,
            mx: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'rgba(74, 124, 89, 0.05)',
          color: '#4a7c59',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Mpesa Payment Initiated
          <IconButton
            aria-label="close"
            onClick={handleMpesaDialogClose}
            sx={{ color: '#4a7c59' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(74, 124, 89, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <LocalAtmIcon sx={{ fontSize: 40, color: '#4a7c59' }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#4a7c59', mb: 2, textAlign: 'center' }}>
                Check your phone!
              </Typography>
              <Typography variant="body1" align="center" sx={{ mb: 1 }}>
                We've sent an STK Push to your phone number:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4a7c59', mb: 2 }}>
                254{formData.phone_number}
              </Typography>
              <Typography variant="body1" align="center">
                Enter your Mpesa PIN to complete the payment.
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Reference: {mpesaResult?.reference_id || 'Processing...'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Amount: KSH {formData.amount}
                </Typography>
              </Box>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
          <Button 
            onClick={handleMpesaDialogClose} 
            variant="contained"
            sx={{ 
              backgroundColor: '#4a7c59',
              '&:hover': { backgroundColor: '#3d664b' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentForm;