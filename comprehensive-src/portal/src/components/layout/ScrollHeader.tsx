import React from 'react';
import styled from 'styled-components';
import { ScrollButton } from '../ui/ScrollButton';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { UserMenu } from '../common/UserMenu';
import { NotificationCenter } from '../common/NotificationCenter';
import { ScrollCoinBalance } from '../common/ScrollCoinBalance';

interface ScrollHeaderProps {
  onSidebarToggle?: () => void;
  onMobileSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

const HeaderContainer = styled.header`
  height: 4rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-bottom-color: #374151;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #1a1a2e;

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;
  }
`;

const LogoIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
`;

const SidebarToggle = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      background: #374151;
      color: #f9fafb;
    }
  }
`;

const DesktopSidebarToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  @media (max-width: 768px) {
    display: none;
  }

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      background: #374151;
      color: #f9fafb;
    }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  min-width: 300px;
  transition: all 0.2s ease-in-out;

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  @media (max-width: 768px) {
    display: none;
  }

  @media (prefers-color-scheme: dark) {
    background: #374151;
    border-color: #4b5563;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #374151;

  &::placeholder {
    color: #9ca3af;
  }

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;

    &::placeholder {
      color: #6b7280;
    }
  }
`;

const SearchIcon = styled.div`
  color: #9ca3af;
  margin-right: 0.5rem;

  @media (prefers-color-scheme: dark) {
    color: #6b7280;
  }
`;

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export const ScrollHeader: React.FC<ScrollHeaderProps> = ({
  onSidebarToggle,
  onMobileSidebarToggle,
  showSidebarToggle = true,
}) => {
  return (
    <HeaderContainer>
      <LeftSection>
        {showSidebarToggle && (
          <>
            <SidebarToggle onClick={onMobileSidebarToggle}>
              <HamburgerIcon />
            </SidebarToggle>
            <DesktopSidebarToggle onClick={onSidebarToggle}>
              <MenuIcon />
            </DesktopSidebarToggle>
          </>
        )}
        
        <Logo>
          <LogoIcon>SU</LogoIcon>
          ScrollUniversity
        </Logo>
        
        <SearchContainer>
          <SearchIcon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </SearchIcon>
          <SearchInput placeholder="Search courses, tutors, or content..." />
        </SearchContainer>
      </LeftSection>

      <RightSection>
        <ScrollCoinBalance />
        <NotificationCenter />
        <LanguageSwitcher />
        <UserMenu />
      </RightSection>
    </HeaderContainer>
  );
};

export default ScrollHeader;