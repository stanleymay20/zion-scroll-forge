/**
 * ModuleLearningContent - Rich content display for course modules
 * Displays markdown content with proper formatting, scripture references, and interactive elements
 */

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Lightbulb,
  PenTool,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleLearningContentProps {
  module: {
    id: string;
    title: string;
    content_md: string;
    order_index: number;
    duration_minutes?: number;
    rewards_amount?: number;
    content?: any;
  };
  courseTitle: string;
  totalModules: number;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isCompleted?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ModuleLearningContent = ({
  module,
  courseTitle,
  totalModules,
  onComplete,
  onNext,
  onPrevious,
  isCompleted = false,
  isFirst = false,
  isLast = false
}: ModuleLearningContentProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  // Parse reading time from content length
  const estimatedReadTime = module.duration_minutes || Math.ceil((module.content_md?.length || 0) / 1000);
  
  // Track scroll progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setReadingProgress(Math.min(100, progress));
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                Module {module.order_index} of {totalModules}
              </Badge>
              <CardTitle className="text-xl md:text-2xl text-foreground">
                {module.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {courseTitle}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{estimatedReadTime} min read</span>
              </div>
              {module.rewards_amount && (
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  <Award className="h-3 w-3 mr-1" />
                  +{module.rewards_amount} XP
                </Badge>
              )}
            </div>
          </div>
          
          {/* Reading Progress */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Reading Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <Progress value={readingProgress} className="h-1" />
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              <ScrollArea 
                className="h-[600px] pr-4" 
                onScrollCapture={handleScroll}
              >
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                  <ReactMarkdown
                    components={{
                      // Custom heading styles
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-foreground border-b border-border pb-3 mb-6">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium text-foreground mt-6 mb-3">
                          {children}
                        </h3>
                      ),
                      // Enhanced blockquotes for scripture
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary bg-primary/5 pl-4 py-3 my-6 italic rounded-r-lg">
                          {children}
                        </blockquote>
                      ),
                      // Enhanced lists
                      ul: ({ children }) => (
                        <ul className="space-y-2 my-4">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span>{children}</span>
                        </li>
                      ),
                      // Styled paragraphs
                      p: ({ children }) => (
                        <p className="leading-relaxed mb-4 text-foreground/90">
                          {children}
                        </p>
                      ),
                      // Strong emphasis
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      // Code blocks for key terms
                      code: ({ children }) => (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                          {children}
                        </code>
                      )
                    }}
                  >
                    {module.content_md || 'Content coming soon...'}
                  </ReactMarkdown>
                </div>
                
                {/* Reflection Section */}
                {module.content_md && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="bg-accent/5 rounded-lg p-6 border border-accent/20">
                      <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-accent" />
                        <h4 className="font-semibold text-foreground">Reflection</h4>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Take a moment to reflect on what you've learned in this module. 
                        How does this content connect to your spiritual journey and purpose?
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={cn("h-4 w-4 mr-2", isBookmarked && "fill-current")} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowNotes(!showNotes)}
              >
                <PenTool className="h-4 w-4 mr-2" />
                Take Notes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ask AI Tutor
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {showNotes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Your Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  placeholder="Write your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {/* Module Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Module Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-foreground">{estimatedReadTime} minutes</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? "bg-green-500" : ""}>
                  {isCompleted ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              {module.rewards_amount && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">XP Reward</span>
                    <span className="text-accent font-medium">{module.rewards_amount} XP</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isFirst}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Module
            </Button>

            <Button
              onClick={onComplete}
              disabled={isCompleted}
              className={cn(
                "w-full sm:w-auto",
                isCompleted && "bg-green-500 hover:bg-green-600"
              )}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isCompleted ? 'Completed' : 'Mark as Complete'}
            </Button>

            <Button
              variant={isLast ? "default" : "outline"}
              onClick={onNext}
              disabled={isLast && !isCompleted}
              className="w-full sm:w-auto"
            >
              {isLast ? 'Finish Course' : 'Next Module'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModuleLearningContent;
