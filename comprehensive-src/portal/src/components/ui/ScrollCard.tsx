import React from 'react';
import styled, { css } from 'styled-components';

interface ScrollCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'prophetic' | 'course' | 'achievement';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
  onClick?: () => void;
}

const StyledCard = styled.div<ScrollCardProps>`
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return css`
          padding: 0;
        `;
      case 'small':
        return css`
          padding: 1rem;
        `;
      case 'large':
        return css`
          padding: 2rem;
        `;
      default:
        return css`
          padding: 1.5rem;
        `;
    }
  }}

  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return css`
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
      case 'prophetic':
        return css`
          background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
          color: #1a1a2e;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
            background-size: 400% 400%;
            animation: gradient 3s ease infinite;
          }

          @keyframes gradient {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `;
      case 'course':
        return css`
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        `;
      case 'achievement':
        return css`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
          position: relative;

          &::before {
            content: '✨';
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
            opacity: 0.7;
          }
        `;
      default:
        return css`
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        `;
    }
  }}

  ${({ hoverable, clickable }) =>
    (hoverable || clickable) &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
      }
    `}

  ${({ clickable }) =>
    clickable &&
    css`
      &:active {
        transform: translateY(-2px);
      }
    `}

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;

    ${({ variant }) =>
      variant === 'default' &&
      css`
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      `}
  }
`;

const CardHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  @media (prefers-color-scheme: dark) {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
  color: inherit;
`;

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const CardContent = styled.div`
  color: inherit;
`;

const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (prefers-color-scheme: dark) {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
`;

export const ScrollCard: React.FC<ScrollCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  clickable = false,
  className,
  onClick,
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      hoverable={hoverable}
      clickable={clickable}
      className={className}
      onClick={onClick}
    >
      {children}
    </StyledCard>
  );
};

// Export sub-components for composition
ScrollCard.Header = CardHeader;
ScrollCard.Title = CardTitle;
ScrollCard.Subtitle = CardSubtitle;
ScrollCard.Content = CardContent;
ScrollCard.Footer = CardFooter;

export default ScrollCard;