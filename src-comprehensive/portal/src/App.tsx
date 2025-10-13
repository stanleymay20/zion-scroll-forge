import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ScrollLayout } from './components/layout/ScrollLayout';
import { GlobalStyles } from './styles/GlobalStyles';
import { scrollTheme } from './styles/theme';

// Page imports
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { DegreesPage } from './pages/DegreesPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AITutorsPage } from './pages/AITutorsPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { XRClassroomsPage } from './pages/XRClassroomsPage';
import { VirtualLabsPage } from './pages/VirtualLabsPage';
import { ScrollNodesPage } from './pages/ScrollNodesPage';
import { ScholarshipsPage } from './pages/ScholarshipsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={scrollTheme}>
          <GlobalStyles />
          <Router>
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Main Application Routes */}
              <Route
                path="/*"
                element={
                  <ScrollLayout
                    showSidebar={true}
                    sidebarCollapsed={sidebarCollapsed}
                    onSidebarToggle={handleSidebarToggle}
                  >
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/courses" element={<CoursesPage />} />
                      <Route path="/degrees" element={<DegreesPage />} />
                      <Route path="/assessments" element={<AssessmentsPage />} />
                      <Route path="/ai-tutors" element={<AITutorsPage />} />
                      <Route path="/mentorship" element={<MentorshipPage />} />
                      <Route path="/xr-classrooms" element={<XRClassroomsPage />} />
                      <Route path="/virtual-labs" element={<VirtualLabsPage />} />
                      <Route path="/scroll-nodes" element={<ScrollNodesPage />} />
                      <Route path="/scholarships" element={<ScholarshipsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                  </ScrollLayout>
                }
              />
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;