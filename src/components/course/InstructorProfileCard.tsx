/**
 * Instructor Profile Card Component
 * Displays instructor information with credentials and experience
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, BookOpen, Users, Star, Mail, Linkedin } from 'lucide-react';

interface InstructorProfileCardProps {
  instructor: {
    id: string;
    name: string;
    title?: string;
    bio?: string;
    avatarUrl?: string;
    faculty?: string;
    yearsExperience?: number;
    studentsTaught?: number;
    coursesCreated?: number;
    rating?: number;
    specializations?: string[];
    credentials?: string[];
    email?: string;
    linkedinUrl?: string;
  };
  compact?: boolean;
}

export function InstructorProfileCard({ instructor, compact = false }: InstructorProfileCardProps) {
  const initials = instructor.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  if (compact) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={instructor.avatarUrl} alt={instructor.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{instructor.name}</h3>
              {instructor.title && (
                <p className="text-sm text-muted-foreground">{instructor.title}</p>
              )}
              {instructor.faculty && (
                <Badge variant="outline" className="mt-1">
                  {instructor.faculty}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About the Instructor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={instructor.avatarUrl} alt={instructor.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-xl">{instructor.name}</h3>
            {instructor.title && (
              <p className="text-sm text-muted-foreground mt-1">{instructor.title}</p>
            )}
            {instructor.faculty && (
              <Badge variant="secondary" className="mt-2">
                {instructor.faculty}
              </Badge>
            )}
            {instructor.rating && (
              <div className="flex items-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{instructor.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">instructor rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {instructor.bio && (
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {instructor.bio}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {instructor.yearsExperience && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Award className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{instructor.yearsExperience}+</p>
              <p className="text-xs text-muted-foreground">Years Experience</p>
            </div>
          )}
          {instructor.studentsTaught && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{instructor.studentsTaught.toLocaleString()}+</p>
              <p className="text-xs text-muted-foreground">Students Taught</p>
            </div>
          )}
          {instructor.coursesCreated && (
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{instructor.coursesCreated}</p>
              <p className="text-xs text-muted-foreground">Courses Created</p>
            </div>
          )}
        </div>

        {/* Specializations */}
        {instructor.specializations && instructor.specializations.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-sm">Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {instructor.specializations.map((spec, index) => (
                <Badge key={index} variant="outline">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        {instructor.credentials && instructor.credentials.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-sm">Credentials</h4>
            <ul className="space-y-1">
              {instructor.credentials.map((credential, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Award className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                  <span>{credential}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact */}
        <div className="flex gap-2 pt-2 border-t">
          {instructor.email && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={`mailto:${instructor.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </a>
            </Button>
          )}
          {instructor.linkedinUrl && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={instructor.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
