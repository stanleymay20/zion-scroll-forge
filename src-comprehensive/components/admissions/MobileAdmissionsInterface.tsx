import React, {useState, useEffect} from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Fab,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Menu,
  Notifications,
  CloudOff,
  Save,
  Send,
  CheckCircle,
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';

import {AdmissionsApplicationService} from '../../services/admissions/ApplicationService';
import {PersonalInfoForm} from './forms/PersonalInfoForm';
import {AcademicHistoryForm} from './forms/AcademicHistoryForm';
import {SpiritualTestimonyForm} from './forms/SpiritualTestimonyForm';
import {DocumentUploadForm} from './forms/DocumentUploadForm';
import {ApplicationReviewForm} from './forms/ApplicationReviewForm';
import {ProgressIndicator} from './ProgressIndicator';
import {OfflineIndicator} from './OfflineIndicator';
import {NotificationCenter} from './NotificationCenter';
import {AccessibilityProvider} from './accessibility/AccessibilityProvider';
import {HelpSystem} from './help/HelpSystem';
import {FeedbackSystem} from './feedback/FeedbackSystem';
import {UserExperienceOptimizer} from './ux/UserExperienceOptimizer';

const MobileContainer = styled(Container)(({theme}) => ({
  padding: theme.spacing(1),
  maxWidth: '100%',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
    maxWidth: 'md',
  },
}));

const StepperContainer = styled(Box)(({theme}) => ({
  '& .MuiStepper-root': {
    padding: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(2),
    },
  },
  '& .MuiStepLabel-label': {
    fontSize: '0.875rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1rem',
    },
  },
  '& .MuiStepContent-root': {
    paddingLeft: theme.spacing(2),
    paddingRight: 0,
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(1),
    },
  },
}));

const FloatingActionButton = styled(Fab)(({theme}) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
}));

interface ApplicationData {
  id?: string;
  personalInfo: any;
  academicHistory: any;
  spiritualTestimony: any;
  documents: any[];
  status: string;
  progress: number;
  lastSaved?: string;
}

interface MobileAdmissionsInterfaceProps {
  onBack?: () => void;
  applicationId?: string;
}

export const MobileAdmissionsInterface: React.FC<MobileAdmissionsInterfaceProps> = ({
  onBack,
  applicationId,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [activeStep, setActiveStep] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  const steps = [
    {
      label: 'Personal Information',
      description: 'Basic personal details and contact information',
      icon: '👤',
    },
    {
      label: 'Academic History',
      description: 'Educational background and achievements',
      icon: '🎓',
    },
    {
      label: 'Spiritual Testimony',
      description: 'Your faith journey and calling',
      icon: '✝️',
    },
    {
      label: 'Documents',
      description: 'Upload required documents',
      icon: '📄',
    },
    {
      label: 'Review & Submit',
      description: 'Review your application and submit',
      icon: '✅',
    },
  ];

  useEffect(() => {
    loadApplicationData();
    setupOfflineDetection();
    loadNotifications();
  }, [applicationId]);

  const loadApplicationData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      let data;
      if (applicationId) {
        data = await AdmissionsApplicationService.getApplication(applicationId);
      } else {
        data = await AdmissionsApplicationService.getCurrentApplication();
      }

      if (data) {
        setApplicationData(data);
        setActiveStep(calculateCurrentStep(data));
      } else {
        // Initialize new application
        const newApplication: ApplicationData = {
          personalInfo: {},
          academicHistory: {},
          spiritualTestimony: {},
          documents: [],
          status: 'draft',
          progress: 0,
        };
        setApplicationData(newApplication);
      }
    } catch (error) {
      console.error('Failed to load application data:', error);
      setIsOffline(true);
      showSnackbar('Failed to load application data. Working offline.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const setupOfflineDetection = (): void => {
    const handleOnline = () => {
      setIsOffline(false);
      showSnackbar('Connection restored. Syncing data...', 'success');
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      showSnackbar('You are now offline. Changes will be saved locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const loadNotifications = async (): Promise<void> => {
    try {
      // Load notifications from service
      const notificationData = await AdmissionsApplicationService.getNotifications();
      setNotifications(notificationData || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const calculateCurrentStep = (data: ApplicationData): number => {
    if (!data.personalInfo || Object.keys(data.personalInfo).length === 0) return 0;
    if (!data.academicHistory || Object.keys(data.academicHistory).length === 0) return 1;
    if (!data.spiritualTestimony || Object.keys(data.spiritualTestimony).length === 0) return 2;
    if (!data.documents || data.documents.length === 0) return 3;
    return 4;
  };

  const saveApplicationData = async (updatedData: ApplicationData): Promise<void> => {
    try {
      setSaving(true);
      
      const savedData = await AdmissionsApplicationService.saveApplication(updatedData);
      setApplicationData(savedData);
      
      showSnackbar('Application saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save application:', error);
      setIsOffline(true);
      showSnackbar('Saved offline. Will sync when connection is restored.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  const handleStepComplete = async (stepData: any): Promise<void> => {
    if (!applicationData) return;

    const updatedData = {...applicationData};
    
    switch (activeStep) {
      case 0:
        updatedData.personalInfo = stepData;
        break;
      case 1:
        updatedData.academicHistory = stepData;
        break;
      case 2:
        updatedData.spiritualTestimony = stepData;
        break;
      case 3:
        updatedData.documents = stepData;
        break;
    }

    updatedData.progress = Math.round(((activeStep + 1) / steps.length) * 100);
    updatedData.lastSaved = new Date().toISOString();
    
    await saveApplicationData(updatedData);
    
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleSubmitApplication = async (): Promise<void> => {
    if (!applicationData) return;

    try {
      setSaving(true);
      
      await AdmissionsApplicationService.submitApplication(applicationData);
      
      showSnackbar('Application submitted successfully!', 'success');
      
      // Navigate back or to status page
      if (onBack) {
        setTimeout(onBack, 2000);
      }
    } catch (error) {
      console.error('Failed to submit application:', error);
      showSnackbar('Failed to submit application. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const syncOfflineData = async (): Promise<void> => {
    try {
      await AdmissionsApplicationService.syncOfflineData();
      showSnackbar('Data synced successfully', 'success');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning'): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const calculateEstimatedTime = (): number => {
    // Estimate time based on remaining steps and average completion time
    const averageTimePerStep = [15, 20, 25, 10, 5]; // minutes per step
    const remainingSteps = steps.length - activeStep - 1;
    
    if (remainingSteps <= 0) return 0;
    
    let totalTime = 0;
    for (let i = activeStep + 1; i < steps.length; i++) {
      totalTime += averageTimePerStep[i] || 15;
    }
    
    return totalTime;
  };

  const renderStepContent = (step: number): JSX.Element => {
    if (!applicationData) return <div />;

    switch (step) {
      case 0:
        return (
          <PersonalInfoForm
            data={applicationData.personalInfo}
            onComplete={handleStepComplete}
            isOffline={isOffline}
            isMobile={isMobile}
          />
        );
      case 1:
        return (
          <AcademicHistoryForm
            data={applicationData.academicHistory}
            onComplete={handleStepComplete}
            isOffline={isOffline}
            isMobile={isMobile}
          />
        );
      case 2:
        return (
          <SpiritualTestimonyForm
            data={applicationData.spiritualTestimony}
            onComplete={handleStepComplete}
            isOffline={isOffline}
            isMobile={isMobile}
          />
        );
      case 3:
        return (
          <DocumentUploadForm
            documents={applicationData.documents}
            onComplete={handleStepComplete}
            isOffline={isOffline}
            isMobile={isMobile}
          />
        );
      case 4:
        return (
          <ApplicationReviewForm
            applicationData={applicationData}
            onSubmit={handleSubmitApplication}
            isSubmitting={saving}
            isOffline={isOffline}
            isMobile={isMobile}
          />
        );
      default:
        return <div />;
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6" color="text.secondary">
            Loading Application...
          </Typography>
        </Box>
      </MobileContainer>
    );
  }

  return (
    <AccessibilityProvider>
      <UserExperienceOptimizer
        currentStep={activeStep}
        totalSteps={steps.length}
        isOffline={isOffline}
        isSaving={saving}
        lastSaved={applicationData?.lastSaved}
        completionPercentage={applicationData?.progress || 0}
        estimatedTimeRemaining={calculateEstimatedTime()}>
        
        <Box sx={{flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh'}}>
          {/* Mobile App Bar */}
          <AppBar position="sticky" elevation={1}>
            <Toolbar>
              {onBack && (
                <IconButton edge="start" color="inherit" onClick={onBack} sx={{mr: 2}}>
                  <ArrowBack />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                ScrollUniversity Application
              </Typography>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <Badge badgeContent={notifications.length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              {isMobile && (
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                  <Menu />
                </IconButton>
              )}
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <MobileContainer>
            <StepperContainer>
              <Stepper
                activeStep={activeStep}
                orientation={isMobile ? 'vertical' : 'horizontal'}
                sx={{mb: 2}}>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      optional={
                        isMobile ? (
                          <Typography variant="caption">{step.description}</Typography>
                        ) : null
                      }>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{step.icon}</span>
                        {step.label}
                      </Box>
                    </StepLabel>
                    {isMobile && (
                      <StepContent>
                        <Paper elevation={0} sx={{p: 2, bgcolor: 'background.paper'}}>
                          {renderStepContent(index)}
                        </Paper>
                      </StepContent>
                    )}
                  </Step>
                ))}
              </Stepper>

              {/* Desktop/Tablet Content */}
              {!isMobile && (
                <Paper elevation={1} sx={{p: 3, mt: 2}}>
                  {renderStepContent(activeStep)}
                </Paper>
              )}
            </StepperContainer>
          </MobileContainer>

          {/* Floating Action Button for Save */}
          {saving && (
            <FloatingActionButton color="primary" disabled>
              <Save />
            </FloatingActionButton>
          )}

          {/* Navigation Drawer */}
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{
              sx: {width: isMobile ? '100%' : 400},
            }}>
            <NotificationCenter
              notifications={notifications}
              onClose={() => setDrawerOpen(false)}
              isMobile={isMobile}
            />
          </Drawer>

          {/* Help System */}
          <HelpSystem
            currentStep={activeStep}
            context={`Application Step ${activeStep + 1}`}
          />

          {/* Feedback System */}
          <FeedbackSystem
            currentStep={activeStep}
            applicationId={applicationData?.id}
            context={`Step: ${steps[activeStep]?.label}`}
          />

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              sx={{width: '100%'}}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </UserExperienceOptimizer>
    </AccessibilityProvider>
  );
};