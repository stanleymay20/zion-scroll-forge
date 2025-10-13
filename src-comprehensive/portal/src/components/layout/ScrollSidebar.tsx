import React from 'react';
import styled, { css } from 'styled-components';
import { NavLink } from 'react-router-dom';

interface ScrollSidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SidebarContainer = styled.aside<{ collapsed?: boolean; mobileOpen?: boolean }>`
  position: fixed;
  top: 4rem;
  left: 0;
  height: calc(100vh - 4rem);
  width: ${({ collapsed }) => (collapsed ? '4rem' : '16rem')};
  background: white;
  border-right: 1px solid #e5e7eb;
  transition: all 0.3s ease-in-out;
  z-index: 45;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: 768px) {
    transform: translateX(${({ mobileOpen }) => (mobileOpen ? '0' : '-100%')});
    width: 16rem;
  }

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-right-color: #374151;
  }
`;

const SidebarContent = styled.div`
  padding: 1rem 0;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3<{ collapsed?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  margin: 0 0 0.75rem 0;
  padding: 0 1rem;
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;

  @media (prefers-color-scheme: dark) {
    color: #6b7280;
  }
`;

const NavItem = styled(NavLink)<{ collapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #6b7280;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  position: relative;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #ffd700;
    }
  }

  ${({ collapsed }) =>
    collapsed &&
    css`
      justify-content: center;
      padding: 0.75rem;

      span {
        display: none;
      }
    `}

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      background: #374151;
      color: #f9fafb;
    }
  }
`;

const NavIcon = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavText = styled.span`
  white-space: nowrap;
`;

const PropheticSection = styled.div`
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #1a1a2e;

  @media (prefers-color-scheme: dark) {
    border-top-color: #374151;
  }
`;

const PropheticTitle = styled.h4<{ collapsed?: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
`;

const PropheticText = styled.p<{ collapsed?: boolean }>`
  font-size: 0.75rem;
  margin: 0;
  opacity: ${({ collapsed }) => (collapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
`;

const navigationItems = [
  {
    section: 'Learning',
    items: [
      {
        to: '/dashboard',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        ),
        label: 'Dashboard',
      },
      {
        to: '/courses',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        ),
        label: 'Courses',
      },
      {
        to: '/degrees',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        ),
        label: 'Degrees',
      },
      {
        to: '/assessments',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        ),
        label: 'Assessments',
      },
    ],
  },
  {
    section: 'AI & Tutoring',
    items: [
      {
        to: '/ai-tutors',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        ),
        label: 'AI Tutors',
      },
      {
        to: '/mentorship',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        ),
        label: 'Mentorship',
      },
    ],
  },
  {
    section: 'Immersive',
    items: [
      {
        to: '/xr-classrooms',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h20v14H2z"></path>
            <path d="M8 21l4-4 4 4"></path>
          </svg>
        ),
        label: 'XR Classrooms',
      },
      {
        to: '/virtual-labs',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m6-6h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4m-6 0a2 2 0 0 0-2-2v-3a2 2 0 0 0 2-2m6 0a2 2 0 0 1 2-2v-3a2 2 0 0 1-2-2"></path>
          </svg>
        ),
        label: 'Virtual Labs',
      },
    ],
  },
  {
    section: 'Community',
    items: [
      {
        to: '/scroll-nodes',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        ),
        label: 'ScrollNodes',
      },
      {
        to: '/scholarships',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        ),
        label: 'Scholarships',
      },
    ],
  },
];

export const ScrollSidebar: React.FC<ScrollSidebarProps> = ({
  collapsed = false,
  mobileOpen = false,
  onMobileClose,
}) => {
  return (
    <SidebarContainer collapsed={collapsed} mobileOpen={mobileOpen}>
      <SidebarContent>
        {navigationItems.map((section) => (
          <NavSection key={section.section}>
            <SectionTitle collapsed={collapsed}>{section.section}</SectionTitle>
            {section.items.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                collapsed={collapsed}
                onClick={onMobileClose}
              >
                <NavIcon>{item.icon}</NavIcon>
                <NavText>{item.label}</NavText>
              </NavItem>
            ))}
          </NavSection>
        ))}
        
        <PropheticSection>
          <PropheticTitle collapsed={collapsed}>✨ Prophetic Wisdom</PropheticTitle>
          <PropheticText collapsed={collapsed}>
            "Trust in the Lord with all your heart and lean not on your own understanding."
          </PropheticText>
        </PropheticSection>
      </SidebarContent>
    </SidebarContainer>
  );
};

export default ScrollSidebar;