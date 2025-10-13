import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useMediaQuery, useTheme} from '@mui/material/styles';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Accessibility,
  VolumeUp,
  Contrast,
  FormatSize,
  Translate,
  Help,
} from '@mui/icons-material';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  fontSize: number;
  screenReader: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  audioDescriptions: boolean;
  language: string;
  colorBlindSupport: boolean;
  focusIndicators: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  resetSettings: () => void;
  isAccessibilityPanelOpen: boolean;
  toggleAccessibilityPanel: () => void;
  announceToScreenReader: (message: string) => void;
  getAriaLabel: (element: string, context?: string) => string;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  fontSize: 16,
  screenReader: false,
  keyboardNavigation: true,
  reducedMotion: false,
  audioDescriptions: false,
  language: 'en',
  colorBlindSupport: false,
  focusIndicators: true,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({children}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('scrolluniversity-accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const [screenReaderAnnouncements, setScreenReaderAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('scrolluniversity-accessibility-settings', JSON.stringify(settings));
    applyAccessibilitySettings();
  }, [settings]);

  useEffect(() => {
    // Apply keyboard navigation listeners
    if (settings.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyboardNavigation);
      return () => document.removeEventListener('keydown', handleKeyboardNavigation);
    }
  }, [settings.keyboardNavigation]);

  const applyAccessibilitySettings = (): void => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Apply large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Apply font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    
    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Apply color blind support
    if (settings.colorBlindSupport) {
      root.classList.add('color-blind-support');
    } else {
      root.classList.remove('color-blind-support');
    }
    
    // Apply focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
  };

  const handleKeyboardNavigation = (event: KeyboardEvent): void => {
    // Handle common keyboard shortcuts
    if (event.altKey) {
      switch (event.key) {
        case 'a':
          event.preventDefault();
          toggleAccessibilityPanel();
          break;
        case 'h':
          event.preventDefault();
          // Focus on help button or open help
          const helpButton = document.querySelector('[data-testid="help-button"]') as HTMLElement;
          if (helpButton) helpButton.focus();
          break;
        case 's':
          event.preventDefault();
          // Skip to main content
          const mainContent = document.querySelector('main') as HTMLElement;
          if (mainContent) mainContent.focus();
          break;
      }
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any): void => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = (): void => {
    setSettings(defaultSettings);
  };

  const toggleAccessibilityPanel = (): void => {
    setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen);
  };

  const announceToScreenReader = (message: string): void => {
    setScreenReaderAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after a delay
    setTimeout(() => {
      setScreenReaderAnnouncements(prev => prev.slice(1));
    }, 1000);
  };

  const getAriaLabel = (element: string, context?: string): string => {
    const labels: Record<string, string> = {
      'application-form': 'ScrollUniversity Application Form',
      'personal-info': 'Personal Information Section',
      'academic-history': 'Academic History Section',
      'spiritual-testimony': 'Spiritual Testimony Section',
      'document-upload': 'Document Upload Section',
      'application-review': 'Application Review Section',
      'submit-button': 'Submit Application',
      'save-button': 'Save Progress',
      'next-button': 'Continue to Next Step',
      'previous-button': 'Go to Previous Step',
      'help-button': 'Get Help and Guidance',
      'accessibility-button': 'Open Accessibility Settings',
    };
    
    const baseLabel = labels[element] || element;
    return context ? `${baseLabel} - ${context}` : baseLabel;
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    isAccessibilityPanelOpen,
    toggleAccessibilityPanel,
    announceToScreenReader,
    getAriaLabel,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}>
        {screenReaderAnnouncements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
      
      {/* Accessibility Floating Action Button */}
      <Tooltip title="Accessibility Settings (Alt+A)">
        <Fab
          color="secondary"
          aria-label={getAriaLabel('accessibility-button')}
          onClick={toggleAccessibilityPanel}
          data-testid="accessibility-button"
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 16,
            left: 16,
            zIndex: 1000,
          }}>
          <Accessibility />
        </Fab>
      </Tooltip>
      
      {/* Accessibility Settings Panel */}
      <Dialog
        open={isAccessibilityPanelOpen}
        onClose={toggleAccessibilityPanel}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="accessibility-dialog-title">
        <DialogTitle id="accessibility-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <Accessibility />
            <Typography variant="h6">Accessibility Settings</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Visual Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Visual Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.highContrast}
                    onChange={(e) => updateSetting('highContrast', e.target.checked)}
                  />
                }
                label="High Contrast Mode"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.largeText}
                    onChange={(e) => updateSetting('largeText', e.target.checked)}
                  />
                }
                label="Large Text"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.colorBlindSupport}
                    onChange={(e) => updateSetting('colorBlindSupport', e.target.checked)}
                  />
                }
                label="Color Blind Support"
              />
              
              <Box mt={2}>
                <Typography gutterBottom>Font Size</Typography>
                <Slider
                  value={settings.fontSize}
                  onChange={(_, value) => updateSetting('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  aria-label="Font size"
                />
              </Box>
            </Box>
            
            {/* Navigation Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Navigation Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.keyboardNavigation}
                    onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                  />
                }
                label="Enhanced Keyboard Navigation"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.focusIndicators}
                    onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                  />
                }
                label="Enhanced Focus Indicators"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  />
                }
                label="Reduce Motion"
              />
            </Box>
            
            {/* Audio Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Audio Settings
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.screenReader}
                    onChange={(e) => updateSetting('screenReader', e.target.checked)}
                  />
                }
                label="Screen Reader Support"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.audioDescriptions}
                    onChange={(e) => updateSetting('audioDescriptions', e.target.checked)}
                  />
                }
                label="Audio Descriptions"
              />
            </Box>
            
            {/* Language Settings */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Language Settings
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  label="Language">
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="pt">Português</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                  <MenuItem value="ar">العربية</MenuItem>
                  <MenuItem value="hi">हिन्दी</MenuItem>
                  <MenuItem value="sw">Kiswahili</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={resetSettings} color="secondary">
            Reset to Defaults
          </Button>
          <Button onClick={toggleAccessibilityPanel} color="primary" variant="contained">
            Apply Settings
          </Button>
        </DialogActions>
      </Dialog>
    </AccessibilityContext.Provider>
  );
};