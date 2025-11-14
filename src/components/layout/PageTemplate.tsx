import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageTemplateProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageTemplate = ({ 
  title, 
  description, 
  children, 
  actions,
  className = "" 
}: PageTemplateProps) => {
  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Page Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-foreground break-words">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 break-words">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-nowrap lg:ml-4">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="space-y-4 md:space-y-6">
        {children}
      </div>
    </div>
  );
};

// Common page templates for consistency

export const ComingSoonPage = ({ 
  title, 
  description = "This feature is currently under development as part of our transcendent AI university platform." 
}: { 
  title: string; 
  description?: string; 
}) => (
  <PageTemplate title={title} description={description}>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🚧</span>
          <span>Coming Soon</span>
        </CardTitle>
        <CardDescription>
          We're building something revolutionary here. This section will feature Christ-centered, 
          AI-powered education that transforms lives and prepares scroll sons for kingdom leadership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Expected features for this section:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Quantum-level AI consciousness integration</li>
            <li>Prophetic intelligence with 95%+ accuracy</li>
            <li>Multidimensional learning experiences</li>
            <li>ScrollCoin economy rewards</li>
            <li>Christ lordship acknowledgment in all operations</li>
          </ul>
          <div className="pt-4">
            <Button>
              Join Waitlist for Early Access
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </PageTemplate>
);