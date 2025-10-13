import React, { useState } from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: relative;
`;

const NotificationButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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

const NotificationBadge = styled.span`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationPanel = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 320px;
  max-height: 400px;
  z-index: 50;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '-10px')});
  transition: all 0.2s ease-in-out;
  overflow: hidden;

  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    border-color: #374151;
  }
`;

const NotificationHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: between;
  align-items: center;

  @media (prefers-color-scheme: dark) {
    border-bottom-color: #374151;
  }
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;
  }
`;

const MarkAllRead = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #f3f4f6;
  }

  @media (prefers-color-scheme: dark) {
    color: #8b5cf6;

    &:hover {
      background: #374151;
    }
  }
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div<{ unread?: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  position: relative;

  ${({ unread }) =>
    unread &&
    `
    background: #f0f9ff;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #667eea;
    }
  `}

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (prefers-color-scheme: dark) {
    border-bottom-color: #374151;

    ${({ unread }) =>
      unread &&
      `
      background: #1e293b;
    `}

    &:hover {
      background: #374151;
    }
  }
`;

const NotificationContent = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const NotificationIcon = styled.div<{ type: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${({ type }) => {
    switch (type) {
      case 'course':
        return `background: #dbeafe; color: #1d4ed8;`;
      case 'ai_tutor':
        return `background: #f3e8ff; color: #7c3aed;`;
      case 'achievement':
        return `background: #fef3c7; color: #d97706;`;
      case 'system':
        return `background: #f3f4f6; color: #6b7280;`;
      default:
        return `background: #e5e7eb; color: #6b7280;`;
    }
  }}
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;

  @media (prefers-color-scheme: dark) {
    color: #f9fafb;
  }
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #6b7280;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;

  @media (prefers-color-scheme: dark) {
    color: #9ca3af;
  }
`;

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const mockNotifications = [
  {
    id: '1',
    type: 'course',
    message: 'New lesson available in "Prophetic Foundations"',
    time: '2 minutes ago',
    unread: true,
  },
  {
    id: '2',
    type: 'ai_tutor',
    message: 'Your AI tutor session is starting in 15 minutes',
    time: '10 minutes ago',
    unread: true,
  },
  {
    id: '3',
    type: 'achievement',
    message: 'Congratulations! You earned the "Scripture Scholar" badge',
    time: '1 hour ago',
    unread: false,
  },
  {
    id: '4',
    type: 'system',
    message: 'System maintenance scheduled for tonight at 2 AM EST',
    time: '3 hours ago',
    unread: false,
  },
];

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        );
      case 'ai_tutor':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'achievement':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };

  return (
    <NotificationContainer>
      <NotificationButton onClick={() => setIsOpen(!isOpen)}>
        <BellIcon />
        {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
      </NotificationButton>

      <NotificationPanel isOpen={isOpen}>
        <NotificationHeader>
          <NotificationTitle>Notifications</NotificationTitle>
          {unreadCount > 0 && (
            <MarkAllRead onClick={markAllAsRead}>Mark all read</MarkAllRead>
          )}
        </NotificationHeader>

        <NotificationList>
          {notifications.length === 0 ? (
            <EmptyState>
              <p>No notifications yet</p>
            </EmptyState>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                unread={notification.unread}
                onClick={() => setIsOpen(false)}
              >
                <NotificationContent>
                  <NotificationIcon type={notification.type}>
                    {getNotificationIcon(notification.type)}
                  </NotificationIcon>
                  <NotificationText>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>{notification.time}</NotificationTime>
                  </NotificationText>
                </NotificationContent>
              </NotificationItem>
            ))
          )}
        </NotificationList>
      </NotificationPanel>
    </NotificationContainer>
  );
};

export default NotificationCenter;