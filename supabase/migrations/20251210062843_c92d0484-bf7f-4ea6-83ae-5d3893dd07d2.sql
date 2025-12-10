-- Create scroll_books table for library books
CREATE TABLE public.scroll_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT DEFAULT 'Scroll University Press',
  subject TEXT NOT NULL,
  faculty TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  cover_image_url TEXT,
  quality_score NUMERIC(3,2) DEFAULT 0.95,
  theological_alignment NUMERIC(3,2) DEFAULT 0.97,
  total_chapters INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scroll_chapters table for book chapters
CREATE TABLE public.scroll_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.scroll_books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  reading_time_minutes INTEGER DEFAULT 10,
  scripture_references TEXT[],
  key_concepts TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scroll_reading_progress for tracking user progress
CREATE TABLE public.scroll_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.scroll_books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.scroll_chapters(id) ON DELETE SET NULL,
  progress_percent INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  bookmarks JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.scroll_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scroll_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scroll_reading_progress ENABLE ROW LEVEL SECURITY;

-- Books are publicly readable
CREATE POLICY "Books are viewable by everyone" ON public.scroll_books FOR SELECT USING (true);

-- Chapters are publicly readable
CREATE POLICY "Chapters are viewable by everyone" ON public.scroll_chapters FOR SELECT USING (true);

-- Users can view their own reading progress
CREATE POLICY "Users can view own reading progress" ON public.scroll_reading_progress 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own reading progress
CREATE POLICY "Users can create own reading progress" ON public.scroll_reading_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reading progress
CREATE POLICY "Users can update own reading progress" ON public.scroll_reading_progress 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_scroll_chapters_book_id ON public.scroll_chapters(book_id);
CREATE INDEX idx_scroll_chapters_order ON public.scroll_chapters(book_id, order_index);
CREATE INDEX idx_scroll_reading_progress_user ON public.scroll_reading_progress(user_id);
CREATE INDEX idx_scroll_books_faculty ON public.scroll_books(faculty);
CREATE INDEX idx_scroll_books_level ON public.scroll_books(level);

-- Create function to update timestamps
CREATE TRIGGER update_scroll_books_updated_at
  BEFORE UPDATE ON public.scroll_books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scroll_chapters_updated_at
  BEFORE UPDATE ON public.scroll_chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();