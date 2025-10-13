import React, { useState } from 'react';
import styled from 'styled-components';
import { SUPPORTED_LANGUAGES } from '@scroll-university/shared-types';

const SwitcherContainer = styled.div`
  position: relative;
`;

const SwitcherButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      background: #374151;
      color: #f9fafb;
    }
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 50;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '-10px')});
  transition: all 0.2s ease-in-out;

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-color: #374151;
  }
`;

const LanguageOption = styled.button<{ isActive?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  color: ${({ isActive }) => (isActive ? '#667eea' : '#374151')};
  font-weight: ${({ isActive }) => (isActive ? '600' : '400')};

  &:hover {
    background: #f3f4f6;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  @media (prefers-color-scheme: dark) {
    color: ${({ isActive }) => (isActive ? '#8b5cf6' : '#f9fafb')};

    &:hover {
      background: #374151;
    }
  }
`;

const LanguageFlag = styled.span`
  font-size: 1.25rem;
`;

const LanguageInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const LanguageName = styled.span`
  font-size: 0.875rem;
`;

const LanguageNative = styled.span`
  font-size: 0.75rem;
  color: #6b7280;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

export const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setIsOpen(false);
    // TODO: Implement actual language switching logic
    console.log('Switching to language:', languageCode);
  };

  const currentLangConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

  return (
    <SwitcherContainer>
      <SwitcherButton onClick={() => setIsOpen(!isOpen)}>
        <GlobeIcon />
        <span>{currentLangConfig?.code.toUpperCase()}</span>
        <ChevronDownIcon />
      </SwitcherButton>

      <DropdownMenu isOpen={isOpen}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <LanguageOption
            key={language.code}
            isActive={language.code === currentLanguage}
            onClick={() => handleLanguageChange(language.code)}
          >
            <LanguageFlag>{language.flag || '🌐'}</LanguageFlag>
            <LanguageInfo>
              <LanguageName>{language.name}</LanguageName>
              <LanguageNative>{language.native_name}</LanguageNative>
            </LanguageInfo>
          </LanguageOption>
        ))}
      </DropdownMenu>
    </SwitcherContainer>
  );
};

export default LanguageSwitcher;