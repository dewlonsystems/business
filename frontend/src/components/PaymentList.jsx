// src/components/PaymentList.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Pagination,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/api';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await paymentAPI.getPaymentList();
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return { color: 'success', label: 'Success' };
      case 'failed':
        return { color: 'error', label: 'Failed' };
      case 'pending':
        return { color: 'warning', label: 'Pending' };
      case 'processing':
        return { color: 'info', label: 'Processing' };
      case 'cancelled':
        return { color: 'default', label: 'Cancelled' };
      case 'timeout':
        return { color: 'secondary', label: 'Timeout' };
      default:
        return { color: 'default', label: status };
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'mpesa':
        return '📱';
      case 'paystack':
        return '💳';
      case 'qr':
        return '🔢';
      default:
        return '💰';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleCloseDetails = () => {
    setSelectedPayment(null);
  };

  const exportToCSV = () => {
    alert('CSV export functionality would be implemented here');
  };

  const exportToPDF = () => {
    alert('PDF export functionality would be implemented here');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2, md: 3 }, overflowX: 'hidden' }}>
        <Box sx={{ 
          width: '100%', 
          maxWidth: '100vw', 
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Skeleton variant="text" width={250} height={40} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>

          {/* Filters Skeleton */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, overflowX: 'auto', maxWidth: '100%' }}>
            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2, minWidth: '100%' }}>
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={160} height={56} sx={{ borderRadius: 1, flexShrink: 0 }} />
              ))}
            </Box>
          </Paper>

          {/* Table Skeleton */}
          <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
            <Box sx={{ 
              overflowX: 'auto',
              width: '100%',
              maxHeight: isMobile ? '60vh' : 'calc(100vh - 350px)',
              overflowY: 'auto'
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {[...Array(7)].map((_, index) => (
                        <TableCell key={index}>
                          <Skeleton variant="text" width={80} />
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(10)].map((_, index) => (
                      <TableRow key={index}>
                        {[...Array(7)].map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton variant="text" width={60} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: 4, 
        mb: 4, 
        px: { xs: 1, sm: 2, md: 3 }, // ← Slightly reduced padding on mobile
        overflowX: 'hidden'
      }}
    >
      {/* 🔥 CRITICAL: Wrap everything to enforce containment */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: '100vw', 
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
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
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
              flexGrow: 1
            }}
          >
            Payment History
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchPayments}
              sx={{ 
                color: '#4a7c59', 
                borderColor: '#4a7c59',
                textTransform: 'none',
                fontWeight: 600,
                minWidth: isMobile ? 'auto' : 100,
                px: isMobile ? 1 : 2,
                '&:hover': {
                  backgroundColor: 'rgba(74, 124, 89, 0.1)',
                  borderColor: '#3d664b'
                }
              }}
            >
              {!isMobile && "Refresh"}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              sx={{ 
                color: '#4a7c59', 
                borderColor: '#4a7c59',
                textTransform: 'none',
                fontWeight: 600,
                minWidth: isMobile ? 'auto' : 120,
                px: isMobile ? 1 : 2,
                '&:hover': {
                  backgroundColor: 'rgba(74, 124, 89, 0.1)',
                  borderColor: '#3d664b'
                }
              }}
            >
              {!isMobile && "Export CSV"}
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/payment')}
              sx={{ 
                backgroundColor: '#4a7c59', 
                textTransform: 'none',
                fontWeight: 600,
                minWidth: isMobile ? 'auto' : 140,
                px: isMobile ? 1 : 3,
                '&:hover': {
                  backgroundColor: '#3d664b'
                }
              }}
            >
              New Payment
            </Button>
          </Box>
        </Box>

        {/* Filters — now scrollable on small screens and strictly contained */}
        <Paper 
          sx={{ 
            p: 2, // slightly reduced padding
            mb: 4, 
            borderRadius: 3,
            border: '1px solid rgba(74, 124, 89, 0.1)',
            backgroundColor: 'rgba(74, 124, 89, 0.02)',
            overflowX: isMobile ? 'auto' : 'visible',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'row', // ← keep as row, but allow scrolling
            flexWrap: isMobile ? 'nowrap' : 'wrap', // ← nowrap on mobile to enable scroll
            gap: isMobile ? 1 : 2, 
            alignItems: 'center',
            minWidth: isMobile ? '100%' : 'auto',
            width: '100%'
          }}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: isMobile ? 180 : 250, // ← reduced mobile min width
                flexShrink: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  width: '100%'
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#4a7c59', mr: 1 }} />,
              }}
            />
            
            <FormControl sx={{ minWidth: isMobile ? 120 : 150, flexShrink: 0 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ 
                  backgroundColor: 'white',
                  width: '100%',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(74, 124, 89, 0.3)',
                  }
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="timeout">Timeout</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: isMobile ? 120 : 150, flexShrink: 0 }} size="small">
              <InputLabel>Method</InputLabel>
              <Select
                value={methodFilter}
                label="Method"
                onChange={(e) => setMethodFilter(e.target.value)}
                sx={{ 
                  backgroundColor: 'white',
                  width: '100%',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(74, 124, 89, 0.3)',
                  }
                }}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="mpesa">Mpesa</MenuItem>
                <MenuItem value="paystack">Paystack</MenuItem>
                <MenuItem value="qr">QR Code</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: isMobile ? 130 : 150,
                flexShrink: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  width: '100%'
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: isMobile ? 130 : 150,
                flexShrink: 0,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  width: '100%'
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Button
              startIcon={<CloseIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setMethodFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              sx={{ 
                color: '#f44336',
                borderColor: '#f44336',
                textTransform: 'none',
                fontWeight: 600,
                minWidth: isMobile ? 100 : 'auto',
                flexShrink: 0,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  borderColor: '#d32f2f'
                }
              }}
              variant="outlined"
            >
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h6" color="text.secondary">
            Showing {paginatedPayments.length} of {filteredPayments.length} payments
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {Math.ceil(filteredPayments.length / rowsPerPage)}
            </Typography>
          </Box>
        </Box>

        {/* Table Card with Scrollable Content */}
        <Card sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          width: '100%',
          maxWidth: '100%',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ 
            overflowX: 'auto',
            width: '100%',
            maxHeight: isMobile ? '60vh' : 'calc(100vh - 350px)',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              height: 8,
              width: 8
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: 4
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: 4,
              '&:hover': {
                background: '#a8a8a8'
              }
            }
          }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(74, 124, 89, 0.05)' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 100 : isTablet ? 120 : 140,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Ref ID
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 80 : isTablet ? 100 : 120,
                        whiteSpace: 'nowrap',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Phone
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 70 : isTablet ? 80 : 100,
                        whiteSpace: 'nowrap',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Amount
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 70 : isTablet ? 80 : 100,
                        whiteSpace: 'nowrap',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 70 : isTablet ? 80 : 100,
                        whiteSpace: 'nowrap',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Method
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 90 : isTablet ? 100 : 120,
                        whiteSpace: 'nowrap',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#4a7c59',
                        minWidth: isMobile ? 60 : isTablet ? 70 : 80,
                        whiteSpace: 'nowrap',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        padding: '8px 12px'
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No payments found
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            {filteredPayments.length === 0 && searchTerm ? 
                              'No payments match your search criteria' : 
                              'Start by initiating your first payment'
                            }
                          </Typography>
                          <Button 
                            variant="contained" 
                            onClick={() => navigate('/payment')}
                            sx={{ 
                              backgroundColor: '#4a7c59', 
                              '&:hover': { 
                                backgroundColor: '#3d664b' 
                              }
                            }}
                          >
                            Initiate Payment
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayments.map((payment) => (
                      <TableRow 
                        key={payment.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(74, 124, 89, 0.02)',
                            transition: 'background-color 0.2s ease-in-out'
                          },
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            fontFamily: 'monospace',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: isMobile ? 100 : isTablet ? 120 : 140,
                            padding: '8px 12px'
                          }}
                        >
                          {payment.reference_id}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            padding: '8px 12px'
                          }}
                        >
                          {payment.phone_number}
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            fontWeight: 600, 
                            color: '#4a7c59',
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            padding: '8px 12px'
                          }}
                        >
                          KSH {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            padding: '8px 12px'
                          }}
                        >
                          <Chip 
                            label={getStatusColor(payment.status).label} 
                            color={getStatusColor(payment.status).color} 
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: isMobile ? '0.65rem' : '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            padding: '8px 12px'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span style={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                              {getPaymentMethodIcon(payment.payment_method)}
                            </span>
                            <Typography variant="body2" textTransform="capitalize" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                              {payment.payment_method}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            padding: '8px 12px'
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: isMobile ? '0.7rem' : '0.8rem' }}>
                              {new Date(payment.created_at).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}>
                              {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            whiteSpace: 'nowrap',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            padding: '8px 12px'
                          }}
                        >
                          <IconButton 
                            onClick={() => handleViewDetails(payment)}
                            size="small"
                            sx={{ 
                              color: '#4a7c59',
                              '&:hover': {
                                backgroundColor: 'rgba(74, 124, 89, 0.1)'
                              },
                              p: 0.5
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: isMobile ? '1rem' : '1.2rem' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Pagination - Outside the scrollable area */}
          {filteredPayments.length > rowsPerPage && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredPayments.length / rowsPerPage)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                variant="outlined"
                shape="rounded"
              />
            </Box>
          )}
        </Card>

        {/* Payment Details Dialog */}
        <Dialog 
          open={!!selectedPayment} 
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 3,
              maxHeight: '90vh',
              overflowY: 'auto'
            }
          }}
        >
          {selectedPayment && (
            <>
              <DialogTitle sx={{ 
                backgroundColor: 'rgba(74, 124, 89, 0.05)',
                borderBottom: '1px solid rgba(74, 124, 89, 0.1)',
                color: '#4a7c59'
              }}>
                Payment Details
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDetails}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#4a7c59',
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers sx={{ pb: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Reference ID
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      fontSize: '0.875rem'
                    }}>
                      {selectedPayment.reference_id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip 
                      label={getStatusColor(selectedPayment.status).label} 
                      color={getStatusColor(selectedPayment.status).color} 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.phone_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Amount
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#4a7c59' }}>
                      KSH {selectedPayment.amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                      <Typography variant="body1" textTransform="capitalize">
                        {selectedPayment.payment_method}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedPayment.created_at).toLocaleString()}
                    </Typography>
                  </Grid>
                  {selectedPayment.description && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedPayment.description}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleCloseDetails} sx={{ color: '#4a7c59' }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box> {/* 🔚 End containment wrapper */}
    </Container>
  );
};

export default PaymentList;