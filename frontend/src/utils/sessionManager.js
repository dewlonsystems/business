// src/utils/sessionManager.js
let inactivityTimer;
const INACTIVITY_DURATION = 3 * 60 * 1000; // 3 minutes = 180,000 ms

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    // Auto-logout: remove token and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, INACTIVITY_DURATION);
};

export const startSessionMonitor = () => {
  // Stop any existing timer
  clearTimeout(inactivityTimer);

  // Reset timer on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    window.addEventListener(event, resetInactivityTimer, true);
  });

  // Handle tab visibility (background/foreground)
  let hiddenStartTime = null;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab is now hidden — record time
      hiddenStartTime = Date.now();
    } else {
      // Tab is visible again
      if (hiddenStartTime) {
        const hiddenDuration = Date.now() - hiddenStartTime;
        if (hiddenDuration >= INACTIVITY_DURATION) {
          // User was away for 3+ minutes → auto-logout
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          // Still within 3 minutes → resume timer
          resetInactivityTimer();
        }
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Start the initial timer
  resetInactivityTimer();

  // Return cleanup function
  return () => {
    clearTimeout(inactivityTimer);
    events.forEach(event => {
      window.removeEventListener(event, resetInactivityTimer, true);
    });
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};