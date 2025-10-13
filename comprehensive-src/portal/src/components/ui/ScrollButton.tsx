import React from 'react';
import styled, { css } from 'styled-components';
import { ButtonHTMLAttributes } from 'react';

interface ScrollButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'prophetic' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const StyledButton = styled.button<ScrollButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ size }) => {
    switch (size) {
      case 'small':
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          min-height: 2rem;
        `;
      case 'large':
        return css`
          padding: 1rem 2rem;
          font-size: 1.125rem;
          min-height: 3rem;
        `;
      default:
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          min-height: 2.5rem;
        `;
    }
  }}

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return css`
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;

          &:hover:not(:disabled) {
            background: #667eea;
            color: white;
            transform: translateY(-1px);
          }
        `;
      case 'tertiary':
        return css`
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;

          &:hover:not(:disabled) {
            background: #f9fafb;
            border-color: #9ca3af;
          }
        `;
      case 'prophetic':
        return css`
          background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
          color: #1a1a2e;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.3),
              transparent
            );
            transition: left 0.5s;
          }

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);

            &::before {
              left: 100%;
            }
          }
        `;
      case 'danger':
        return css`
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          }
        `;
      default:
        return css`
          background: #f3f4f6;
          color: #374151;

          &:hover:not(:disabled) {
            background: #e5e7eb;
          }
        `;
    }
  }}

  ${({ loading }) =>
    loading &&
    css`
      pointer-events: none;
    `}
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  order: ${({ position }) => (position === 'right' ? 1 : -1)};
`;

export const ScrollButton: React.FC<ScrollButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {!loading && icon && (
        <IconWrapper position={iconPosition}>{icon}</IconWrapper>
      )}
      {children}
    </StyledButton>
  );
};

export default ScrollButton;