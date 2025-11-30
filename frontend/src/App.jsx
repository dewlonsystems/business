// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PaymentForm from './components/PaymentForm';
import PaymentList from './components/PaymentList';
import ReceiptList from './components/ReceiptList';
import PrivateRoute from './components/PrivateRoute';
import PaymentRedirect from './components/PaymentRedirect';
import PaymentStatus from './components/PaymentStatus';
import SessionReplacedBanner from './components/SessionReplacedBanner'; // 👈 ONLY ADDITION

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a7c59', // Dark green
    },
    secondary: {
      main: '#7ba08c', // Light green
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  // 👇 ONLY ADDITION: state and event listener
  const [showSessionReplaced, setShowSessionReplaced] = useState(false);

  useEffect(() => {
    const handleSessionReplaced = () => {
      setShowSessionReplaced(true);
    };

    window.addEventListener('sessionReplaced', handleSessionReplaced);

    return () => {
      window.removeEventListener('sessionReplaced', handleSessionReplaced);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* 👇 ONLY ADDITION: show banner if triggered */}
        {showSessionReplaced && <SessionReplacedBanner />}
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Protected routes with layout */}
          <Route 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/payment" element={<PaymentForm />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/receipts" element={<ReceiptList />} />
            <Route path="/pay/:referenceId" element={<PaymentRedirect />} />
            <Route path="/payment-status/:referenceId" element={<PaymentStatus />} />
          </Route>
          {/* Redirect any unmatched routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;