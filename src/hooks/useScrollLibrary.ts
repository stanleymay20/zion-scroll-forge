import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ ScrollLibrary — Christ governs all knowledge and wisdom");

// Types for ScrollLibrary
export interface ScrollBook {
  id: string;
  title: string;
  subtitle?: string | null;
  author: string;
  subject: string;
  faculty: string;
  level: string;
  description?: string | null;
  total_chapters: number;
  total_pages: number;
  quality_score?: number | null;
  theological_alignment?: number | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  chapters?: number;
  pages?: number;
}

export interface ScrollChapter {
  id: string;
  book_id: string;
  title: string;
  order_index: number;
  content: string;
  summary?: string | null;
  reading_time_minutes: number;
  scripture_references?: string[] | null;
  key_concepts?: string[] | null;
  created_at: string;
}

export interface StudyPack {
  id: string;
  course_id: string;
  title: string;
  faculty: string;
  summary_content?: string;
  flashcard_count: number;
  quiz_count: number;
  created_at: string;
}

export interface LibrarySearchResult {
  book_id: string;
  chapter_id?: string;
  title: string;
  excerpt: string;
  relevance_score: number;
  content_type: 'book' | 'chapter' | 'study-pack';
}

// Fetch all books from database
export async function getScrollBooks(): Promise<ScrollBook[]> {
  const { data, error } = await supabase
    .from('scroll_books')
    .select('*')
    .order('title');
  
  if (error) {
    console.error('Error fetching scroll books:', error);
    throw error;
  }
  
  return (data || []).map(book => ({
    ...book,
    subject: book.faculty || 'General',
    chapters: book.total_chapters,
    pages: book.total_pages,
  }));
}

// Fetch single book
export async function getScrollBook(bookId: string): Promise<ScrollBook | null> {
  const { data, error } = await supabase
    .from('scroll_books')
    .select('*')
    .eq('id', bookId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching scroll book:', error);
    throw error;
  }
  
  return data ? {
    ...data,
    subject: data.faculty || 'General',
    chapters: data.total_chapters,
    pages: data.total_pages,
  } : null;
}

// Fetch chapters for a book
export async function getBookChapters(bookId: string): Promise<ScrollChapter[]> {
  const { data, error } = await supabase
    .from('scroll_chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('order_index');
  
  if (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }
  
  return data || [];
}

// Study packs - for now return empty, can be implemented with a table later
export async function getStudyPacks(): Promise<StudyPack[]> {
  // TODO: Implement study packs table
  return [];
}

export async function getCourseStudyPack(courseId: string): Promise<StudyPack | null> {
  return null;
}

// Search library
export async function searchLibrary(query: string): Promise<LibrarySearchResult[]> {
  const results: LibrarySearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Search books
  const { data: books } = await supabase
    .from('scroll_books')
    .select('id, title, subtitle, faculty, author')
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,faculty.ilike.%${query}%`);
  
  if (books) {
    books.forEach(book => {
      results.push({
        book_id: book.id,
        title: book.title,
        excerpt: book.subtitle || `${book.faculty} - by ${book.author}`,
        relevance_score: 0.9,
        content_type: 'book',
      });
    });
  }
  
  // Search chapters
  const { data: chapters } = await supabase
    .from('scroll_chapters')
    .select('id, book_id, title, summary')
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
    .limit(10);
  
  if (chapters) {
    chapters.forEach(chapter => {
      results.push({
        book_id: chapter.book_id,
        chapter_id: chapter.id,
        title: chapter.title,
        excerpt: chapter.summary || 'Chapter content',
        relevance_score: 0.7,
        content_type: 'chapter',
      });
    });
  }
  
  return results.sort((a, b) => b.relevance_score - a.relevance_score);
}

export async function getBooksByFaculty(faculty: string): Promise<ScrollBook[]> {
  const { data, error } = await supabase
    .from('scroll_books')
    .select('*')
    .eq('faculty', faculty)
    .order('title');
  
  if (error) throw error;
  
  return (data || []).map(book => ({
    ...book,
    subject: book.faculty || 'General',
    chapters: book.total_chapters,
    pages: book.total_pages,
  }));
}

export async function getStudyPacksByFaculty(faculty: string): Promise<StudyPack[]> {
  return [];
}

// Hooks
export const useScrollBooks = () =>
  useQuery({ 
    queryKey: ["scroll-books"], 
    queryFn: getScrollBooks 
  });

export const useScrollBook = (bookId: string) =>
  useQuery({ 
    queryKey: ["scroll-book", bookId], 
    queryFn: () => getScrollBook(bookId),
    enabled: !!bookId 
  });

export const useBookChapters = (bookId: string) =>
  useQuery({ 
    queryKey: ["book-chapters", bookId], 
    queryFn: () => getBookChapters(bookId),
    enabled: !!bookId 
  });

export const useStudyPacks = () =>
  useQuery({ 
    queryKey: ["study-packs"], 
    queryFn: getStudyPacks 
  });

export const useCourseStudyPack = (courseId: string) =>
  useQuery({ 
    queryKey: ["course-study-pack", courseId], 
    queryFn: () => getCourseStudyPack(courseId),
    enabled: !!courseId 
  });

export const useLibrarySearch = (query: string) =>
  useQuery({ 
    queryKey: ["library-search", query], 
    queryFn: () => searchLibrary(query),
    enabled: query.length >= 2 
  });

export const useBooksByFaculty = (faculty: string) =>
  useQuery({
    queryKey: ["scroll-books-faculty", faculty],
    queryFn: () => getBooksByFaculty(faculty),
    enabled: !!faculty
  });

export const useStudyPacksByFaculty = (faculty: string) =>
  useQuery({
    queryKey: ["study-packs-faculty", faculty],
    queryFn: () => getStudyPacksByFaculty(faculty),
    enabled: !!faculty
  });
