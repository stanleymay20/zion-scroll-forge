import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Fab,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Help,
  ExpandMore,
  Search,
  School,
  Person,
  Church,
  Upload,
  CheckCircle,
  Phone,
  Email,
  Chat,
  VideoCall,
  Book,
  PlayArrow,
} from '@mui/icons-material';

interface HelpTopic {
  id: string;
  title: string;
  category: 'getting-started' | 'personal-info' | 'academic' | 'spiritual' | 'documents' | 'technical';
  content: string;
  keywords: string[];
  videoUrl?: string;
  relatedTopics?: string[];
}

interface HelpSystemProps {
  currentStep?: number;
  context?: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Your Application',
    category: 'getting-started',
    content: `Welcome to ScrollUniversity! Your application journey consists of five main steps:
    
    1. Personal Information - Basic details about you
    2. Academic History - Your educational background
    3. Spiritual Testimony - Your faith journey and calling
    4. Document Upload - Required supporting documents
    5. Review & Submit - Final review and submission
    
    You can save your progress at any time and return later. The system will automatically save your work as you complete each section.`,
    keywords: ['start', 'begin', 'overview', 'steps', 'process'],
    videoUrl: '/help/videos/getting-started.mp4',
    relatedTopics: ['personal-info-help', 'saving-progress'],
  },
  {
    id: 'personal-info-help',
    title: 'Personal Information Requirements',
    category: 'personal-info',
    content: `Please provide accurate personal information as it will be used for official records:
    
    • Full legal name (as it appears on official documents)
    • Valid email address (you'll receive important updates here)
    • Phone number with country code
    • Date of birth
    • Nationality and current country of residence
    • Emergency contact information
    
    All fields marked with * are required. Make sure your email is accessible as we'll send important updates there.`,
    keywords: ['personal', 'name', 'email', 'phone', 'birth', 'nationality'],
    relatedTopics: ['document-requirements'],
  },
  {
    id: 'academic-history-help',
    title: 'Academic History Guidelines',
    category: 'academic',
    content: `Provide details about your educational background:
    
    • High school information (name, graduation date, GPA if available)
    • Any college or university experience
    • Standardized test scores (SAT, ACT, etc.)
    • Professional certifications or training
    • Language proficiency levels
    
    If you're homeschooled or have non-traditional education, please provide equivalent information and any documentation you have.`,
    keywords: ['academic', 'education', 'school', 'college', 'gpa', 'tests', 'homeschool'],
    relatedTopics: ['document-requirements', 'transcript-help'],
  },
  {
    id: 'spiritual-testimony-help',
    title: 'Spiritual Testimony Guidelines',
    category: 'spiritual',
    content: `Share your faith journey authentically and thoughtfully:
    
    • Salvation testimony - How you came to know Jesus Christ
    • Spiritual growth - Your journey of faith development
    • Ministry experience - Any involvement in church or ministry
    • Calling clarity - How you sense God leading you to ScrollUniversity
    • Church involvement - Your current church affiliation and involvement
    
    Be honest and personal. We're looking for genuine faith and a sense of calling, not perfect theology. Share your heart and God's work in your life.`,
    keywords: ['spiritual', 'testimony', 'salvation', 'calling', 'ministry', 'church', 'faith'],
    relatedTopics: ['character-references'],
  },
  {
    id: 'document-requirements',
    title: 'Required Documents',
    category: 'documents',
    content: `Please upload the following documents:
    
    Required:
    • Official high school transcript or equivalent
    • Government-issued photo ID (passport, driver's license)
    • Character reference letters (2-3 from pastors, teachers, or mentors)
    
    Optional but recommended:
    • Standardized test scores
    • College transcripts (if applicable)
    • Ministry recommendation letters
    • Portfolio of work or achievements
    
    All documents should be clear, legible scans or photos. PDF format is preferred.`,
    keywords: ['documents', 'transcript', 'id', 'reference', 'letters', 'upload'],
    relatedTopics: ['upload-help', 'character-references'],
  },
  {
    id: 'upload-help',
    title: 'How to Upload Documents',
    category: 'technical',
    content: `Follow these steps to upload your documents:
    
    1. Ensure documents are clear and legible
    2. Use PDF, JPG, or PNG format
    3. Keep file sizes under 10MB each
    4. Click "Choose File" or drag and drop
    5. Add a description for each document
    6. Click "Upload" to save
    
    If you're having trouble, try:
    • Reducing file size using compression tools
    • Taking a clearer photo with good lighting
    • Scanning at 300 DPI resolution
    • Contacting support for assistance`,
    keywords: ['upload', 'documents', 'file', 'size', 'format', 'pdf', 'photo'],
    relatedTopics: ['document-requirements', 'technical-support'],
  },
  {
    id: 'saving-progress',
    title: 'Saving Your Progress',
    category: 'technical',
    content: `Your application progress is automatically saved:
    
    • Auto-save occurs every 30 seconds while typing
    • Manual save by clicking the save button
    • Progress is saved when moving between steps
    • Works offline - data syncs when reconnected
    
    You can safely close your browser and return later. Your progress will be preserved and you can continue where you left off.`,
    keywords: ['save', 'progress', 'auto-save', 'offline', 'continue'],
    relatedTopics: ['technical-support'],
  },
  {
    id: 'technical-support',
    title: 'Technical Support',
    category: 'technical',
    content: `If you're experiencing technical difficulties:
    
    1. Try refreshing your browser
    2. Clear your browser cache and cookies
    3. Try a different browser (Chrome, Firefox, Safari)
    4. Check your internet connection
    5. Disable browser extensions temporarily
    
    Still having issues? Contact our support team:
    • Email: admissions@scrolluniversity.edu
    • Phone: +1 (555) 123-4567
    • Live chat available 9 AM - 5 PM EST
    • Video call support by appointment`,
    keywords: ['technical', 'support', 'browser', 'connection', 'help', 'contact'],
    relatedTopics: ['contact-support'],
  },
];

export const HelpSystem: React.FC<HelpSystemProps> = ({currentStep, context}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTopic, setExpandedTopic] = useState<string | false>(false);

  const categories = [
    {id: 'all', label: 'All Topics', icon: <Help />},
    {id: 'getting-started', label: 'Getting Started', icon: <PlayArrow />},
    {id: 'personal-info', label: 'Personal Info', icon: <Person />},
    {id: 'academic', label: 'Academic', icon: <School />},
    {id: 'spiritual', label: 'Spiritual', icon: <Church />},
    {id: 'documents', label: 'Documents', icon: <Upload />},
    {id: 'technical', label: 'Technical', icon: <Help />},
  ];

  const filteredTopics = helpTopics.filter(topic => {
    const matchesSearch = searchQuery === '' || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getContextualHelp = (): HelpTopic[] => {
    if (currentStep === undefined) return [];
    
    const stepCategories: Record<number, string> = {
      0: 'personal-info',
      1: 'academic',
      2: 'spiritual',
      3: 'documents',
      4: 'getting-started',
    };
    
    const category = stepCategories[currentStep];
    return helpTopics.filter(topic => topic.category === category);
  };

  const contextualHelp = getContextualHelp();

  const handleTopicExpand = (topicId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedTopic(isExpanded ? topicId : false);
  };

  const openHelp = (): void => {
    setIsHelpOpen(true);
    
    // Auto-select relevant category based on current step
    if (currentStep !== undefined) {
      const stepCategories: Record<number, string> = {
        0: 'personal-info',
        1: 'academic',
        2: 'spiritual',
        3: 'documents',
        4: 'getting-started',
      };
      setSelectedCategory(stepCategories[currentStep] || 'all');
    }
  };

  const closeHelp = (): void => {
    setIsHelpOpen(false);
    setSearchQuery('');
    setExpandedTopic(false);
  };

  return (
    <>
      {/* Help Floating Action Button */}
      <Tooltip title="Get Help and Guidance (Alt+H)">
        <Fab
          color="primary"
          aria-label="Get help and guidance"
          onClick={openHelp}
          data-testid="help-button"
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 16,
            right: isMobile ? 16 : 80,
            zIndex: 1000,
          }}>
          <Help />
        </Fab>
      </Tooltip>

      {/* Contextual Help Hints */}
      {contextualHelp.length > 0 && !isHelpOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: isMobile ? 80 : 100,
            right: 16,
            maxWidth: 300,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'primary.main',
            borderRadius: 2,
            p: 2,
            boxShadow: 3,
            zIndex: 999,
          }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            💡 Quick Help
          </Typography>
          <Typography variant="body2" sx={{mb: 1}}>
            {contextualHelp[0].title}
          </Typography>
          <Button size="small" onClick={openHelp} startIcon={<Help />}>
            Learn More
          </Button>
        </Box>
      )}

      {/* Help Dialog */}
      <Dialog
        open={isHelpOpen}
        onClose={closeHelp}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="help-dialog-title">
        <DialogTitle id="help-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <Help color="primary" />
            <Typography variant="h6">Help & Guidance</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* Category Filter */}
            <Box display="flex" flexWrap="wrap" gap={1}>
              {categories.map(category => (
                <Chip
                  key={category.id}
                  icon={category.icon}
                  label={category.label}
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                  variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {/* Contextual Help Section */}
            {contextualHelp.length > 0 && selectedCategory === 'all' && (
              <Box>
                <Typography variant="h6" gutterBottom color="primary">
                  Help for Current Step
                </Typography>
                {contextualHelp.map(topic => (
                  <Accordion
                    key={`contextual-${topic.id}`}
                    expanded={expandedTopic === `contextual-${topic.id}`}
                    onChange={handleTopicExpand(`contextual-${topic.id}`)}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">{topic.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>
                        {topic.content}
                      </Typography>
                      {topic.videoUrl && (
                        <Button
                          startIcon={<PlayArrow />}
                          sx={{mt: 1}}
                          onClick={() => window.open(topic.videoUrl, '_blank')}>
                          Watch Video Guide
                        </Button>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {/* All Help Topics */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCategory === 'all' ? 'All Help Topics' : `${categories.find(c => c.id === selectedCategory)?.label} Help`}
              </Typography>
              
              {filteredTopics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No help topics found matching your search.
                </Typography>
              ) : (
                filteredTopics.map(topic => (
                  <Accordion
                    key={topic.id}
                    expanded={expandedTopic === topic.id}
                    onChange={handleTopicExpand(topic.id)}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">{topic.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{whiteSpace: 'pre-line', mb: 2}}>
                        {topic.content}
                      </Typography>
                      
                      {topic.videoUrl && (
                        <Button
                          startIcon={<PlayArrow />}
                          sx={{mb: 1}}
                          onClick={() => window.open(topic.videoUrl, '_blank')}>
                          Watch Video Guide
                        </Button>
                      )}
                      
                      {topic.relatedTopics && topic.relatedTopics.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            Related topics:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {topic.relatedTopics.map(relatedId => {
                              const relatedTopic = helpTopics.find(t => t.id === relatedId);
                              return relatedTopic ? (
                                <Chip
                                  key={relatedId}
                                  label={relatedTopic.title}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setExpandedTopic(relatedId)}
                                />
                              ) : null;
                            })}
                          </Box>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>

            {/* Contact Support */}
            <Box
              sx={{
                bgcolor: 'background.default',
                p: 2,
                borderRadius: 1,
                mt: 2,
              }}>
              <Typography variant="h6" gutterBottom>
                Still Need Help?
              </Typography>
              <Typography variant="body2" sx={{mb: 2}}>
                Our admissions team is here to support you throughout your application process.
              </Typography>
              
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={1}>
                <Button
                  startIcon={<Email />}
                  href="mailto:admissions@scrolluniversity.edu"
                  size="small">
                  Email Support
                </Button>
                <Button
                  startIcon={<Phone />}
                  href="tel:+15551234567"
                  size="small">
                  Call Us
                </Button>
                <Button
                  startIcon={<Chat />}
                  size="small">
                  Live Chat
                </Button>
                <Button
                  startIcon={<VideoCall />}
                  size="small">
                  Video Call
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeHelp} color="primary" variant="contained">
            Close Help
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};