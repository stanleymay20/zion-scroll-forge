import React, {useState, useEffect, useCallback} from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Info,
  Error,
  Wifi,
  WifiOff,
  Save,
  CloudDone,
  Schedule,
} from '@mui/icons-material';

interface UXOptimizationProps {
  currentStep: number;
  totalSteps: number;
  isOffline: boolean;
  isSaving: boolean;
  lastSaved?: string;
  completionPercentage: number;
  estimatedTimeRemaining?: number;
  children: React.ReactNode;
}

interface UXNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  duration?: number;
  action?: () => void;
  actionLabel?: string;
}

interface PerformanceMetrics {
  loadTime: number;
  interactionDelay: number;
  formValidationTime: number;
  saveTime: number;
}

export const UserExperienceOptimizer: React.FC<UXOptimizationProps> = ({
  currentStep,
  totalSteps,
  isOffline,
  isSaving,
  lastSaved,
  completionPercentage,
  estimatedTimeRemaining,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [notifications, setNotifications] = useState<UXNotification[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    interactionDelay: 0,
    formValidationTime: 0,
    saveTime: 0,
  });
  const [userEngagement, setUserEngagement] = useState({
    timeOnStep: 0,
    interactionCount: 0,
    scrollDepth: 0,
    formFieldsCompleted: 0,
  });

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime,
      }));
    };

    // Measure initial load time
    if (document.readyState === 'complete') {
      measureLoadTime();
    } else {
      window.addEventListener('load', measureLoadTime);
      return () => window.removeEventListener('load', measureLoadTime);
    }
  }, [currentStep]);

  // User engagement tracking
  useEffect(() => {
    const startTime = Date.now();
    let interactionCount = 0;
    let maxScrollDepth = 0;

    const trackInteraction = () => {
      interactionCount++;
      setUserEngagement(prev => ({
        ...prev,
        interactionCount,
      }));
    };

    const trackScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        setUserEngagement(prev => ({
          ...prev,
          scrollDepth: maxScrollDepth,
        }));
      }
    };

    const updateTimeOnStep = () => {
      const timeOnStep = Math.round((Date.now() - startTime) / 1000);
      setUserEngagement(prev => ({
        ...prev,
        timeOnStep,
      }));
    };

    // Event listeners
    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    document.addEventListener('scroll', trackScroll);
    
    const timeInterval = setInterval(updateTimeOnStep, 1000);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      document.removeEventListener('scroll', trackScroll);
      clearInterval(timeInterval);
    };
  }, [currentStep]);

  // Smart notifications based on user behavior
  useEffect(() => {
    const checkForUXImprovements = () => {
      // Long time on step without interaction
      if (userEngagement.timeOnStep > 300 && userEngagement.interactionCount < 5) {
        addNotification({
          id: 'help-suggestion',
          type: 'info',
          message: 'Need help with this step? Click the help button for guidance.',
          duration: 8000,
        });
      }

      // Slow performance
      if (performanceMetrics.loadTime > 3000) {
        addNotification({
          id: 'performance-warning',
          type: 'warning',
          message: 'Page loading slowly. Try refreshing or check your connection.',
          duration: 6000,
        });
      }

      // Progress encouragement
      if (completionPercentage >= 50 && completionPercentage < 75) {
        addNotification({
          id: 'progress-encouragement',
          type: 'success',
          message: 'Great progress! You\'re more than halfway through your application.',
          duration: 5000,
        });
      }
    };

    const timer = setTimeout(checkForUXImprovements, 10000);
    return () => clearTimeout(timer);
  }, [userEngagement, performanceMetrics, completionPercentage]);

  // Offline/online status notifications
  useEffect(() => {
    if (isOffline) {
      addNotification({
        id: 'offline-status',
        type: 'warning',
        message: 'You\'re offline. Your progress will be saved locally and synced when you reconnect.',
        duration: 0, // Persistent
      });
    } else {
      removeNotification('offline-status');
      if (notifications.some(n => n.id === 'offline-status')) {
        addNotification({
          id: 'online-status',
          type: 'success',
          message: 'Connection restored! Your data is being synced.',
          duration: 4000,
        });
      }
    }
  }, [isOffline]);

  // Save status notifications
  useEffect(() => {
    if (isSaving) {
      addNotification({
        id: 'saving-status',
        type: 'info',
        message: 'Saving your progress...',
        duration: 0,
      });
    } else {
      removeNotification('saving-status');
      if (lastSaved) {
        addNotification({
          id: 'saved-status',
          type: 'success',
          message: 'Progress saved successfully!',
          duration: 3000,
        });
      }
    }
  }, [isSaving, lastSaved]);

  const addNotification = useCallback((notification: UXNotification) => {
    setNotifications(prev => {
      // Remove existing notification with same ID
      const filtered = prev.filter(n => n.id !== notification.id);
      return [...filtered, notification];
    });

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const getStepName = (step: number): string => {
    const stepNames = [
      'Personal Information',
      'Academic History',
      'Spiritual Testimony',
      'Document Upload',
      'Review & Submit',
    ];
    return stepNames[step] || `Step ${step + 1}`;
  };

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getProgressColor = (): 'primary' | 'secondary' | 'success' | 'warning' => {
    if (completionPercentage < 25) return 'warning';
    if (completionPercentage < 75) return 'primary';
    return 'success';
  };

  return (
    <Box sx={{position: 'relative', minHeight: '100vh'}}>
      {/* Enhanced Progress Indicator */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          p: 2,
        }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" color="primary">
            {getStepName(currentStep)}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            {/* Connection Status */}
            <Tooltip title={isOffline ? 'Offline' : 'Online'}>
              <Box display="flex" alignItems="center">
                {isOffline ? (
                  <WifiOff color="warning" fontSize="small" />
                ) : (
                  <Wifi color="success" fontSize="small" />
                )}
              </Box>
            </Tooltip>

            {/* Save Status */}
            {isSaving ? (
              <Tooltip title="Saving...">
                <Save color="primary" fontSize="small" />
              </Tooltip>
            ) : lastSaved ? (
              <Tooltip title={`Last saved: ${new Date(lastSaved).toLocaleTimeString()}`}>
                <CloudDone color="success" fontSize="small" />
              </Tooltip>
            ) : null}

            {/* Step Progress */}
            <Typography variant="body2" color="text.secondary">
              {currentStep + 1} of {totalSteps}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box display="flex" alignItems="center" gap={2}>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            color={getProgressColor()}
            sx={{flexGrow: 1, height: 8, borderRadius: 4}}
          />
          <Typography variant="body2" color="text.secondary" minWidth="fit-content">
            {Math.round(completionPercentage)}%
          </Typography>
        </Box>

        {/* Time Estimate */}
        {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Estimated time remaining: {formatTimeRemaining(estimatedTimeRemaining)}
            </Typography>
          </Box>
        )}

        {/* Quick Stats for Debugging (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            <Chip
              size="small"
              label={`Load: ${Math.round(performanceMetrics.loadTime)}ms`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Time: ${Math.floor(userEngagement.timeOnStep / 60)}:${(userEngagement.timeOnStep % 60).toString().padStart(2, '0')}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Interactions: ${userEngagement.interactionCount}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Scroll: ${userEngagement.scrollDepth}%`}
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{position: 'relative'}}>
        {children}
      </Box>

      {/* Notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: isMobile ? 'center' : 'left',
          }}
          sx={{
            bottom: isMobile ? 160 + (index * 70) : 80 + (index * 70),
          }}>
          <Alert
            severity={notification.type}
            onClose={() => removeNotification(notification.id)}
            action={
              notification.action && notification.actionLabel ? (
                <button onClick={notification.action}>
                  {notification.actionLabel}
                </button>
              ) : undefined
            }
            sx={{
              width: '100%',
              maxWidth: isMobile ? '90vw' : 400,
            }}>
            {notification.message}
          </Alert>
        </Snackbar>
      ))}

      {/* Loading Overlay for Poor Performance */}
      {performanceMetrics.loadTime > 5000 && (
        <Fade in={true}>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                p: 4,
                borderRadius: 2,
                textAlign: 'center',
                maxWidth: 400,
              }}>
              <LinearProgress sx={{mb: 2}} />
              <Typography variant="h6" gutterBottom>
                Optimizing Experience
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We're working to improve the loading speed. Thank you for your patience.
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};