/**
 * Mobile-Optimized Layout Component
 * Provides mobile-specific layout patterns for complex pages
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  headerActions,
  footer,
  className,
  contentClassName,
}) => {
  const { isMobile } = useMobileDetection();
  const navigate = useNavigate();

  if (!isMobile) {
    // Desktop layout - just render children
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Mobile Header */}
      {(title || showBackButton || headerActions) && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="flex-shrink-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {title && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold truncate">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={cn('flex-1 overflow-auto', contentClassName)}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized card grid
export interface MobileCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileCardGrid: React.FC<MobileCardGridProps> = ({
  children,
  columns = 1,
  gap = 'md',
  className,
}) => {
  const { isMobile } = useMobileDetection();

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={cn(
        'grid',
        isMobile ? `grid-cols-${columns}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile-optimized tabs
export interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const { isMobile } = useMobileDetection();

  if (!isMobile) {
    // Desktop tabs
    return (
      <div className={cn('flex space-x-2 border-b border-border', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Mobile tabs - horizontal scroll
  return (
    <div className={cn('overflow-x-auto border-b border-border', className)}>
      <div className="flex space-x-1 px-4 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
              'border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            )}
          >
            <div className="flex items-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Mobile-optimized list item
export interface MobileListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export const MobileListItem: React.FC<MobileListItemProps> = ({
  title,
  subtitle,
  icon,
  badge,
  onClick,
  rightContent,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center space-x-3 p-4 border-b border-border',
        onClick && 'cursor-pointer active:bg-accent/50 transition-colors',
        className
      )}
    >
      {icon && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium truncate">{title}</h3>
          {badge && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>

      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
};
