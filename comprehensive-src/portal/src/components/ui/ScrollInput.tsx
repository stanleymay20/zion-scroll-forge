import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

interface ScrollInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'prophetic' | 'spiritual';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  multiline?: boolean;
  rows?: number;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  font-family: 'ScrollFont', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;
  }
`;

const InputWrapper = styled.div<{ hasIcon?: boolean; iconPosition?: 'left' | 'right' }>`
  position: relative;
  display: flex;
  align-items: center;

  ${({ hasIcon, iconPosition }) =>
    hasIcon &&
    css`
      ${iconPosition === 'left' &&
      css`
        padding-left: 2.5rem;
      `}
      ${iconPosition === 'right' &&
      css`
        padding-right: 2.5rem;
      `}
    `}
`;

const StyledInput = styled.input<ScrollInputProps>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: white;
  color: #374151;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${({ variant }) => {
    switch (variant) {
      case 'prophetic':
        return css`
          border-color: #ffd700;
          background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);

          &:focus {
            border-color: #ffb347;
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
          }
        `;
      case 'spiritual':
        return css`
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);

          &:focus {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }
        `;
      default:
        return '';
    }
  }}

  ${({ error }) =>
    error &&
    css`
      border-color: #ef4444;

      &:focus {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `}

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;

    &::placeholder {
      color: #6b7280;
    }

    &:disabled {
      background: #111827;
      color: #6b7280;
    }
  }
`;

const StyledTextarea = styled.textarea<ScrollInputProps>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: white;
  color: #374151;
  transition: all 0.2s ease-in-out;
  resize: vertical;
  min-height: 100px;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${({ variant }) => {
    switch (variant) {
      case 'prophetic':
        return css`
          border-color: #ffd700;
          background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);

          &:focus {
            border-color: #ffb347;
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
          }
        `;
      case 'spiritual':
        return css`
          border-color: #8b5cf6;
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);

          &:focus {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }
        `;
      default:
        return '';
    }
  }}

  ${({ error }) =>
    error &&
    css`
      border-color: #ef4444;

      &:focus {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `}

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;

    &::placeholder {
      color: #6b7280;
    }

    &:disabled {
      background: #111827;
      color: #6b7280;
    }
  }
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  position: absolute;
  ${({ position }) => (position === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;')}
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
  pointer-events: none;

  @media (prefers-color-scheme: dark) {
    color: #6b7280;
  }
`;

const HelperText = styled.span`
  font-size: 0.75rem;
  color: #6b7280;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
`;

export const ScrollInput = forwardRef<HTMLInputElement, ScrollInputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      fullWidth = false,
      icon,
      iconPosition = 'left',
      multiline = false,
      rows = 4,
      className,
      ...props
    },
    ref
  ) => {
    const InputComponent = multiline ? StyledTextarea : StyledInput;

    return (
      <InputContainer fullWidth={fullWidth} className={className}>
        {label && <Label>{label}</Label>}
        <InputWrapper hasIcon={!!icon} iconPosition={iconPosition}>
          <InputComponent
            ref={multiline ? undefined : ref}
            variant={variant}
            error={error}
            rows={multiline ? rows : undefined}
            {...props}
          />
          {icon && <IconWrapper position={iconPosition}>{icon}</IconWrapper>}
        </InputWrapper>
        {error && <ErrorText>{error}</ErrorText>}
        {!error && helperText && <HelperText>{helperText}</HelperText>}
      </InputContainer>
    );
  }
);

ScrollInput.displayName = 'ScrollInput';

export default ScrollInput;