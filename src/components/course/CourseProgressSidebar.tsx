/**
 * Course Progress Sidebar Component
 * Displays course structure and progress with navigation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Play,
  Lock
} from 'lucide-react';

interface CourseProgressSidebarProps {
  modules: any[];
  currentLectureIndex: number;
  allLectures: any[];
  progress: number;
  onLectureSelect: (index: number) => void;
}

export function CourseProgressSidebar({ 
  modules, 
  currentLectureIndex, 
  allLectures,
  progress,
  onLectureSelect 
}: CourseProgressSidebarProps) {
  const completedLectures = Math.floor((progress / 100) * allLectures.length);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-base">Course Progress</CardTitle>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completedLectures} of {allLectures.length} lectures completed
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {modules.map((module, moduleIndex) => {
            const moduleLectures = module.learning_materials || [];
            const moduleStartIndex = allLectures.findIndex(
              (l: any) => l.moduleId === module.id
            );
            
            return (
              <AccordionItem key={module.id} value={`module-${moduleIndex}`}>
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2 text-left">
                    <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Module {moduleIndex + 1}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {module.title}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-1 pb-2">
                  {moduleLectures.map((lecture: any, lectureIndex: number) => {
                    const globalIndex = moduleStartIndex + lectureIndex;
                    const isCompleted = globalIndex < completedLectures;
                    const isCurrent = globalIndex === currentLectureIndex;
                    const isLocked = globalIndex > completedLectures && globalIndex !== currentLectureIndex;

                    return (
                      <Button
                        key={lecture.id}
                        variant={isCurrent ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-3"
                        onClick={() => !isLocked && onLectureSelect(globalIndex)}
                        disabled={isLocked}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : isCurrent ? (
                            <Play className="h-4 w-4 text-primary flex-shrink-0" />
                          ) : isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate ${
                              isCurrent ? 'font-medium' : ''
                            }`}>
                              {lecture.title}
                            </p>
                            {lecture.kind && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {lecture.kind}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Quick Stats */}
        <div className="mt-6 pt-4 border-t space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Modules</span>
            <span className="font-medium">{modules.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Lectures</span>
            <span className="font-medium">{allLectures.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium text-green-500">{completedLectures}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium text-orange-500">
              {allLectures.length - completedLectures}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
