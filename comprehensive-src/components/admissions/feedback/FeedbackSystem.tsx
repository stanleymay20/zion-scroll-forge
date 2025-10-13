import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Chip,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Slide,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Feedback,
  Send,
  Close,
  ThumbUp,
  ThumbDown,
  BugReport,
  Lightbulb,
  Star,
} from '@mui/icons-material';
import {TransitionProps} from '@mui/material/transitions';

interface FeedbackData {
  type: 'bug' | 'suggestion' | 'general' | 'usability';
  rating: number;
  category: string;
  title: string;
  description: string;
  currentStep?: number;
  userAgent: string;
  timestamp: string;
  userId?: string;
  applicationId?: string;
}

interface FeedbackSystemProps {
  currentStep?: number;
  applicationId?: string;
  userId?: string;
  context?: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({
  currentStep,
  applicationId,
  userId,
  context,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion' | 'general' | 'usability'>('general');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showQuickFeedback, setShowQuickFeedback] = useState(false);
  const [quickFeedbackGiven, setQuickFeedbackGiven] = useState(false);

  const feedbackTypes = [
    {
      value: 'general',
      label: 'General Feedback',
      icon: <Feedback />,
      description: 'Share your overall experience',
    },
    {
      value: 'bug',
      label: 'Report a Bug',
      icon: <BugReport />,
      description: 'Something is not working correctly',
    },
    {
      value: 'suggestion',
      label: 'Suggestion',
      icon: <Lightbulb />,
      description: 'Ideas for improvement',
    },
    {
      value: 'usability',
      label: 'Usability Issue',
      icon: <ThumbDown />,
      description: 'Something is confusing or hard to use',
    },
  ];

  const categories = {
    general: ['Application Process', 'User Interface', 'Performance', 'Content', 'Other'],
    bug: ['Form Submission', 'File Upload', 'Navigation', 'Display Issues', 'Login/Authentication'],
    suggestion: ['New Feature', 'Improvement', 'Content Addition', 'Design Enhancement', 'Accessibility'],
    usability: ['Confusing Interface', 'Unclear Instructions', 'Navigation Issues', 'Mobile Experience', 'Accessibility'],
  };

  useEffect(() => {
    // Show quick feedback prompt after user spends time on a step
    const timer = setTimeout(() => {
      if (!quickFeedbackGiven && currentStep !== undefined) {
        setShowQuickFeedback(true);
      }
    }, 120000); // Show after 2 minutes

    return () => clearTimeout(timer);
  }, [currentStep, quickFeedbackGiven]);

  const handleSubmitFeedback = async (): Promise<void> => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      type: feedbackType,
      rating,
      category,
      title: title.trim(),
      description: description.trim(),
      currentStep,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId,
      applicationId,
    };

    try {
      // Submit feedback to backend
      const response = await fetch('/api/admissions/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        resetForm();
        setIsFeedbackOpen(false);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // Store feedback locally if submission fails
      const storedFeedback = JSON.parse(localStorage.getItem('pending-feedback') || '[]');
      storedFeedback.push(feedbackData);
      localStorage.setItem('pending-feedback', JSON.stringify(storedFeedback));
      
      setShowSuccessMessage(true);
      resetForm();
      setIsFeedbackOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFeedback = async (isPositive: boolean): Promise<void> => {
    const quickFeedbackData: FeedbackData = {
      type: 'general',
      rating: isPositive ? 5 : 2,
      category: 'Quick Feedback',
      title: `Quick feedback for step ${currentStep}`,
      description: isPositive ? 'User found this step helpful' : 'User had difficulty with this step',
      currentStep,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId,
      applicationId,
    };

    try {
      await fetch('/api/admissions/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quickFeedbackData),
      });
    } catch (error) {
      console.error('Failed to submit quick feedback:', error);
    }

    setQuickFeedbackGiven(true);
    setShowQuickFeedback(false);
  };

  const resetForm = (): void => {
    setFeedbackType('general');
    setRating(5);
    setCategory('');
    setTitle('');
    setDescription('');
  };

  const openFeedback = (): void => {
    setIsFeedbackOpen(true);
  };

  const closeFeedback = (): void => {
    setIsFeedbackOpen(false);
    resetForm();
  };

  return (
    <>
      {/* Quick Feedback Prompt */}
      {showQuickFeedback && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 140 : 80,
            right: 16,
            p: 2,
            maxWidth: 300,
            zIndex: 1001,
            bgcolor: 'background.paper',
          }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2">
              How is this step going?
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShowQuickFeedback(false)}
              sx={{ml: 1, mt: -0.5}}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          <Box display="flex" gap={1} mt={1}>
            <Button
              size="small"
              startIcon={<ThumbUp />}
              onClick={() => handleQuickFeedback(true)}
              color="success">
              Good
            </Button>
            <Button
              size="small"
              startIcon={<ThumbDown />}
              onClick={() => handleQuickFeedback(false)}
              color="error">
              Difficult
            </Button>
            <Button
              size="small"
              onClick={openFeedback}
              variant="outlined">
              Details
            </Button>
          </Box>
        </Paper>
      )}

      {/* Feedback Floating Action Button */}
      <Tooltip title="Share Feedback">
        <Fab
          color="secondary"
          aria-label="Share feedback"
          onClick={openFeedback}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 16,
            right: isMobile ? 80 : 16,
            zIndex: 1000,
          }}>
          <Feedback />
        </Fab>
      </Tooltip>

      {/* Feedback Dialog */}
      <Dialog
        open={isFeedbackOpen}
        onClose={closeFeedback}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={Transition}
        aria-labelledby="feedback-dialog-title">
        <DialogTitle id="feedback-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <Feedback color="primary" />
            <Typography variant="h6">Share Your Feedback</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Feedback Type Selection */}
            <FormControl component="fieldset">
              <FormLabel component="legend">What type of feedback do you have?</FormLabel>
              <RadioGroup
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as any)}>
                {feedbackTypes.map(type => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {type.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Rating */}
            <Box>
              <FormLabel component="legend">Overall Rating</FormLabel>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue || 1)}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {rating === 1 && 'Very Poor'}
                  {rating === 2 && 'Poor'}
                  {rating === 3 && 'Average'}
                  {rating === 4 && 'Good'}
                  {rating === 5 && 'Excellent'}
                </Typography>
              </Box>
            </Box>

            {/* Category */}
            <FormControl fullWidth>
              <FormLabel>Category</FormLabel>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {categories[feedbackType].map(cat => (
                  <Chip
                    key={cat}
                    label={cat}
                    onClick={() => setCategory(cat)}
                    color={category === cat ? 'primary' : 'default'}
                    variant={category === cat ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </FormControl>

            {/* Title */}
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              required
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed feedback..."
              multiline
              rows={4}
              required
            />

            {/* Context Information */}
            {(currentStep !== undefined || context) && (
              <Box
                sx={{
                  bgcolor: 'background.default',
                  p: 2,
                  borderRadius: 1,
                }}>
                <Typography variant="caption" color="text.secondary">
                  Context Information:
                </Typography>
                {currentStep !== undefined && (
                  <Typography variant="body2">
                    Current Step: {currentStep + 1}
                  </Typography>
                )}
                {context && (
                  <Typography variant="body2">
                    Context: {context}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeFeedback}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={isSubmitting || !title.trim() || !description.trim()}
            startIcon={isSubmitting ? undefined : <Send />}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}>
        <Alert
          onClose={() => setShowSuccessMessage(false)}
          severity="success"
          sx={{width: '100%'}}>
          Thank you for your feedback! We appreciate your input and will use it to improve the application experience.
        </Alert>
      </Snackbar>
    </>
  );
};