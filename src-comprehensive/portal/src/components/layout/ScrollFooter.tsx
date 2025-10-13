import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 2rem 1.5rem 1rem;
  margin-top: auto;

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-top-color: #374151;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FooterTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;
  }
`;

const FooterLink = styled.a`
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #667eea;
  }

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      color: #8b5cf6;
    }
  }
`;

const FooterText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const FooterBottom = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (prefers-color-scheme: dark) {
    border-top-color: #374151;
  }
`;

const Copyright = styled.div`
  color: #6b7280;
  font-size: 0.875rem;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-left: auto;
`;

const SocialLink = styled.a`
  color: #6b7280;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #667eea;
  }

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;

    &:hover {
      color: #8b5cf6;
    }
  }
`;

const PropheticQuote = styled.div`
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #1a1a2e;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-style: italic;
  font-weight: 500;
  margin-bottom: 1rem;
`;

export const ScrollFooter: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <PropheticQuote>
            "For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future." - Jeremiah 29:11
          </PropheticQuote>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Learning</FooterTitle>
          <FooterLink href="/courses">Browse Courses</FooterLink>
          <FooterLink href="/degrees">Degree Programs</FooterLink>
          <FooterLink href="/ai-tutors">AI Tutors</FooterLink>
          <FooterLink href="/xr-classrooms">XR Classrooms</FooterLink>
          <FooterLink href="/assessments">Assessments</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Community</FooterTitle>
          <FooterLink href="/scroll-nodes">ScrollNodes</FooterLink>
          <FooterLink href="/mentorship">Mentorship</FooterLink>
          <FooterLink href="/scholarships">Scholarships</FooterLink>
          <FooterLink href="/global-outreach">Global Outreach</FooterLink>
          <FooterLink href="/prayer-network">Prayer Network</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Resources</FooterTitle>
          <FooterLink href="/help">Help Center</FooterLink>
          <FooterLink href="/documentation">Documentation</FooterLink>
          <FooterLink href="/api">API Reference</FooterLink>
          <FooterLink href="/status">System Status</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
        </FooterSection>

        <FooterSection>
          <FooterTitle>About</FooterTitle>
          <FooterText>
            ScrollUniversity is a prophetic, AI-powered global university dedicated to training kingdom youth, global remnant, and reformers through scroll-governed education.
          </FooterText>
          <FooterLink href="/mission">Our Mission</FooterLink>
          <FooterLink href="/contact">Contact Us</FooterLink>
          <FooterLink href="/careers">Careers</FooterLink>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <Copyright>
          © 2024 ScrollUniversity. All rights reserved. Built with prophetic wisdom and divine guidance.
        </Copyright>
        
        <SocialLinks>
          <SocialLink href="https://twitter.com/scrolluniversity" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </SocialLink>
          
          <SocialLink href="https://youtube.com/scrolluniversity" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75,15.02 15.5,11.75 9.75,8.48"></polygon>
            </svg>
          </SocialLink>
          
          <SocialLink href="https://github.com/scrolluniversity" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
            </svg>
          </SocialLink>
        </SocialLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

export default ScrollFooter;