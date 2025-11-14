// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  CircularProgress,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon, 
  TrendingUp as TrendingUpIcon, 
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const statsResponse = await paymentAPI.getOverallStats();
      const paymentsResponse = await paymentAPI.getPaymentList();
      
      setStats(statsResponse.data);
      setRecentPayments(paymentsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
      default:
        return 'default';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const StatsCard = ({ title, value, icon, color, change, loading }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          borderColor: 'rgba(74, 124, 89, 0.2)'
        },
        border: '1px solid rgba(74, 124, 89, 0.1)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" component="div" sx={{ 
                mt: 1, 
                fontWeight: 'bold', 
                color: color,
                fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' }
              }}>
                {value}
              </Typography>
            )}
            {loading ? (
              <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'transparent', 
                    width: 20, 
                    height: 20, 
                    mr: 1,
                    color: '#4caf50'
                  }}
                >
                  <TrendingUpIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ 
            bgcolor: `${color}15`, 
            color: color,
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(74, 124, 89, 0.2)'
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 2 }} />
        </Box>

        {/* Stats Cards Skeleton */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: 160, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Skeleton variant="text" width={100} height={24} />
                    <Skeleton variant="text" width={80} height={32} sx={{ mt: 1 }} />
                    <Skeleton variant="text" width={120} height={20} sx={{ mt: 1 }} />
                  </Box>
                  <Skeleton variant="circular" width={56} height={56} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Content Areas Skeleton */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: 200 }}>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 3 }} />
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width="100%" height={48} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, height: 200 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Skeleton variant="text" width={150} height={28} />
              </Box>
              <Box sx={{ p: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                    <Box>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={80} height={16} sx={{ mt: 0.5 }} />
                    </Box>
                    <Box>
                      <Skeleton variant="text" width={60} height={20} />
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ mt: 0.5, borderRadius: 1 }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: 4, 
        mb: 4,
        px: { xs: 2, sm: 3, md: 4 } 
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            color: '#333',
            fontWeight: 700,
            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' }
          }}
        >
          Dashboard Overview
        </Typography>
        <Button 
          variant="outlined" 
          onClick={handleLogout} 
          sx={{ 
            color: '#4a7c59', 
            borderColor: '#4a7c59',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: 'rgba(74, 124, 89, 0.1)',
              borderColor: '#3d664b'
            }
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard 
            title="Total Payments"
            value={stats?.total_payments || 0}
            icon={<PaymentIcon />}
            color="#4a7c59"
            change="+12% from last month"
            loading={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard 
            title="Successful"
            value={stats?.successful_payments || 0}
            icon={<SuccessIcon />}
            color="#4caf50"
            change="+8% from last month"
            loading={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard 
            title="Failed"
            value={stats?.failed_payments || 0}
            icon={<ErrorIcon />}
            color="#f44336"
            change="-3% from last month"
            loading={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard 
            title="Success Rate"
            value={stats ? `${stats.success_rate.toFixed(1)}%` : "0%"}
            icon={<TrendingUpIcon />}
            color="#2196f3"
            change="+2% from last month"
            loading={false}
          />
        </Grid>
      </Grid>

      {/* Quick Actions and Recent Activity */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid rgba(74, 124, 89, 0.1)',
              background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: '#4a7c59', 
                fontWeight: 600,
                fontSize: '1.25rem'
              }}
            >
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button 
                variant="contained" 
                onClick={() => navigate('/payment')}
                startIcon={<PaymentIcon />}
                sx={{ 
                  backgroundColor: '#4a7c59', 
                  '&:hover': { 
                    backgroundColor: '#3d664b' 
                  },
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem'
                }}
              >
                Initiate New Payment
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/payments')}
                sx={{ 
                  color: '#4a7c59', 
                  borderColor: '#4a7c59',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem'
                }}
              >
                View All Payments
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/receipts')}
                sx={{ 
                  color: '#4a7c59', 
                  borderColor: '#4a7c59',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem'
                }}
              >
                Manage Receipts
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 0, 
              height: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(74, 124, 89, 0.1)',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
            }}
          >
            <CardHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ mr: 1, color: '#4a7c59' }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#4a7c59', 
                      fontWeight: 600,
                      fontSize: '1.25rem'
                    }}
                  >
                    Recent Transactions
                  </Typography>
                </Box>
              }
              sx={{ 
                backgroundColor: 'rgba(74, 124, 89, 0.05)',
                borderBottom: '1px solid rgba(74, 124, 89, 0.1)',
                py: 1.5
              }}
            />
            <CardContent sx={{ p: 0 }}>
              {recentPayments.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  py: 6,
                  textAlign: 'center'
                }}>
                  <ReceiptIcon sx={{ fontSize: 60, color: 'rgba(74, 124, 89, 0.3)', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No transactions yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start by initiating your first payment
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/payment')}
                    sx={{ 
                      mt: 2,
                      backgroundColor: '#4a7c59', 
                      '&:hover': { 
                        backgroundColor: '#3d664b' 
                      }
                    }}
                  >
                    Initiate Payment
                  </Button>
                </Box>
              ) : (
                <Box>
                  {recentPayments.map((payment) => (
                    <Box 
                      key={payment.id} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        py: 2,
                        px: 3,
                        borderBottom: '1px solid #f0f0f0',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': {
                          backgroundColor: 'rgba(74, 124, 89, 0.02)',
                          transition: 'background-color 0.2s ease-in-out'
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {payment.reference_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {payment.phone_number} • {new Date(payment.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4a7c59' }}>
                          {formatAmount(payment.amount)}
                        </Typography>
                        <Chip 
                          label={payment.status} 
                          size="small"
                          color={getStatusColor(payment.status)}
                          sx={{ 
                            mt: 0.5,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;