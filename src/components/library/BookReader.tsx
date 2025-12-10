import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  Bookmark,
  List,
  X,
  Home
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Chapter {
  id: string;
  book_id: string;
  title: string;
  order_index: number;
  content: string;
  summary: string | null;
  reading_time_minutes: number;
  scripture_references: string[] | null;
  key_concepts: string[] | null;
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  faculty: string;
  level: string;
  description: string | null;
  total_chapters: number;
}

export default function BookReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Fetch book details
  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['scroll-book', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scroll_books')
        .select('*')
        .eq('id', bookId)
        .single();
      
      if (error) throw error;
      return data as Book;
    },
    enabled: !!bookId,
  });

  // Fetch chapters
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['scroll-chapters', bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scroll_chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as Chapter[];
    },
    enabled: !!bookId,
  });

  // Fetch user's reading progress
  const { data: userProgress } = useQuery({
    queryKey: ['reading-progress', bookId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('scroll_reading_progress')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!bookId,
  });

  // Update reading progress mutation
  const updateProgress = useMutation({
    mutationFn: async (progress: { chapterIndex: number; progressPercent: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentChapter = chapters[progress.chapterIndex];
      
      const { error } = await supabase
        .from('scroll_reading_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          chapter_id: currentChapter?.id,
          progress_percent: progress.progressPercent,
          last_read_at: new Date().toISOString(),
          completed_at: progress.progressPercent >= 100 ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,book_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', bookId] });
    },
  });

  // Calculate and update progress
  useEffect(() => {
    if (chapters.length > 0) {
      const progress = Math.round(((currentChapterIndex + 1) / chapters.length) * 100);
      setReadingProgress(progress);
      updateProgress.mutate({ chapterIndex: currentChapterIndex, progressPercent: progress });
    }
  }, [currentChapterIndex, chapters.length]);

  // Restore last reading position
  useEffect(() => {
    if (userProgress && chapters.length > 0) {
      const lastChapterIndex = chapters.findIndex(c => c.id === userProgress.chapter_id);
      if (lastChapterIndex >= 0) {
        setCurrentChapterIndex(lastChapterIndex);
      }
    }
  }, [userProgress, chapters]);

  const currentChapter = chapters[currentChapterIndex];

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setShowTOC(false);
    window.scrollTo(0, 0);
  };

  if (bookLoading || chaptersLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Book not found</p>
          <Button onClick={() => navigate('/scroll-library')} className="mt-4">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/scroll-library')} className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold">{book.title}</h1>
              {book.subtitle && <p className="text-muted-foreground mt-2">{book.subtitle}</p>}
              <p className="text-muted-foreground mt-4">by {book.author}</p>
              <Separator className="my-6" />
              <p className="text-muted-foreground">{book.description}</p>
              <Badge className="mt-4">{book.faculty}</Badge>
              <p className="text-amber-600 mt-6">
                Content is being generated. Please check back soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/scroll-library')}>
              <Home className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="font-medium text-sm truncate max-w-[200px] lg:max-w-[400px]">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground">
                Chapter {currentChapterIndex + 1} of {chapters.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowTOC(!showTOC)}>
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Progress value={readingProgress} className="h-1" />
      </header>

      {/* Table of Contents Sidebar */}
      {showTOC && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowTOC(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Table of Contents</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowTOC(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-60px)]">
              <div className="p-4 space-y-1">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => goToChapter(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentChapterIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="text-xs opacity-70">Chapter {index + 1}</span>
                    <p className="font-medium text-sm">{chapter.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      {chapter.reading_time_minutes} min
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chapter Header */}
          <header className="mb-8 text-center">
            <Badge variant="outline" className="mb-4">
              Chapter {currentChapterIndex + 1}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {currentChapter.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentChapter.reading_time_minutes} min read
              </span>
            </div>
          </header>

          {/* Chapter Summary */}
          {currentChapter.summary && (
            <Card className="mb-8 bg-muted/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Chapter Summary</h3>
                <p className="text-muted-foreground">{currentChapter.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Scripture References */}
          {currentChapter.scripture_references && currentChapter.scripture_references.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {currentChapter.scripture_references.map((ref, i) => (
                <Badge key={i} variant="secondary">
                  📖 {ref}
                </Badge>
              ))}
            </div>
          )}

          {/* Chapter Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown>{currentChapter.content}</ReactMarkdown>
          </div>

          {/* Key Concepts */}
          {currentChapter.key_concepts && currentChapter.key_concepts.length > 0 && (
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Key Concepts</h3>
                <ul className="space-y-2">
                  {currentChapter.key_concepts.map((concept, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">✦</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </article>
      </main>

      {/* Fixed Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousChapter}
            disabled={currentChapterIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentChapterIndex + 1} / {chapters.length}
          </span>
          
          <Button
            onClick={goToNextChapter}
            disabled={currentChapterIndex === chapters.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
