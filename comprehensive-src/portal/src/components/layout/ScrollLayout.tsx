import React from 'react';
import styled from 'styled-components';
import { ScrollHeader } from './ScrollHeader';
import { ScrollSidebar } from './ScrollSidebar';
import { ScrollFooter } from './ScrollFooter';

interface ScrollLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;

  @media (prefers-color-scheme: dark) {
    background: #0f172a;
  }
`;

const MainContainer = styled.div<{ showSidebar?: boolean; sidebarCollapsed?: boolean }>`
  display: flex;
  flex: 1;
  transition: all 0.3s ease-in-out;
`;

const ContentArea = styled.main<{ showSidebar?: boolean; sidebarCollapsed?: boolean }>`
  flex: 1;
  padding: 2rem;
  margin-left: ${({ showSidebar, sidebarCollapsed }) => {
    if (!showSidebar) return '0';
    return sidebarCollapsed ? '4rem' : '16rem';
  }};
  transition: margin-left 0.3s ease-in-out;
  min-height: calc(100vh - 4rem); /* Account for header */

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const ScrollOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? 'visible' : 'hidden')};
  transition: all 0.3s ease-in-out;

  @media (min-width: 769px) {
    display: none;
  }
`;

export const ScrollLayout: React.FC<ScrollLayoutProps> = ({
  children,
  showSidebar = true,
  sidebarCollapsed = false,
  onSidebarToggle,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleOverlayClick = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <LayoutContainer>
      <ScrollHeader
        onSidebarToggle={onSidebarToggle}
        onMobileSidebarToggle={handleMobileSidebarToggle}
        showSidebarToggle={showSidebar}
      />
      
      <MainContainer showSidebar={showSidebar} sidebarCollapsed={sidebarCollapsed}>
        {showSidebar && (
          <ScrollSidebar
            collapsed={sidebarCollapsed}
            mobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <ContentArea showSidebar={showSidebar} sidebarCollapsed={sidebarCollapsed}>
          {children}
        </ContentArea>
      </MainContainer>
      
      <ScrollOverlay show={isMobileSidebarOpen} onClick={handleOverlayClick} />
      
      <ScrollFooter />
    </LayoutContainer>
  );
};

export default ScrollLayout;