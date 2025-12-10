import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, GraduationCap, Star } from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  subtitle?: string | null;
  author: string;
  faculty: string;
  level: string;
  description?: string | null;
  totalChapters: number;
  totalPages: number;
  qualityScore?: number;
  theologicalAlignment?: number;
  readingProgress?: number;
}

export default function BookCard({
  id,
  title,
  subtitle,
  author,
  faculty,
  level,
  description,
  totalChapters,
  totalPages,
  qualityScore = 0.95,
  theologicalAlignment = 0.97,
  readingProgress = 0,
}: BookCardProps) {
  const navigate = useNavigate();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Book Cover Header */}
      <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <BookOpen className="absolute bottom-4 right-4 h-16 w-16 text-primary/20" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="secondary" className={getLevelColor(level)}>
            {level}
          </Badge>
        </div>
        {readingProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={readingProgress} className="h-1 rounded-none" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            {faculty}
          </Badge>
        </div>
        
        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {subtitle}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground mt-2">
          by {author}
        </p>

        {description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {totalChapters} chapters
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalPages} pages
          </span>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 text-amber-500" />
            <span>{(qualityScore * 100).toFixed(0)}% quality</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <GraduationCap className="h-3 w-3 text-primary" />
            <span>{(theologicalAlignment * 100).toFixed(0)}% aligned</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/scroll-library/book/${id}`)}
        >
          {readingProgress > 0 ? 'Continue Reading' : 'Start Reading'}
        </Button>
      </CardFooter>
    </Card>
  );
}
