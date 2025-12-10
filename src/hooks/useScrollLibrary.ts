import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollLibrary — Christ governs all knowledge and wisdom");

// Types for ScrollLibrary
export interface ScrollBook {
  id: string;
  title: string;
  subtitle?: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  course_reference?: string;
  integrity_hash?: string;
  quality_score?: number;
  theological_alignment?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScrollChapter {
  id: string;
  book_id: string;
  title: string;
  order_index: number;
  content: string;
  reading_time: number;
  created_at: string;
}

export interface StudyPack {
  id: string;
  course_id: string;
  title: string;
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

// Mock data for library content (until backend integration)
const mockBooks: ScrollBook[] = [
  {
    id: 'book-1',
    title: 'Foundations of Biblical Theology',
    subtitle: 'A Comprehensive Guide to Understanding Scripture',
    subject: 'Theology',
    level: 'beginner',
    quality_score: 0.95,
    theological_alignment: 0.98,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'Advanced Prophetic Studies',
    subtitle: 'Understanding Divine Revelation',
    subject: 'Prophetic Studies',
    level: 'advanced',
    quality_score: 0.92,
    theological_alignment: 0.96,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: 'Kingdom Economics',
    subtitle: 'Biblical Principles for Prosperity',
    subject: 'Economics',
    level: 'intermediate',
    quality_score: 0.89,
    theological_alignment: 0.94,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockStudyPacks: StudyPack[] = [
  {
    id: 'pack-1',
    course_id: 'course-1',
    title: 'New Testament Survey Study Pack',
    summary_content: 'Comprehensive study materials for NT survey',
    flashcard_count: 50,
    quiz_count: 5,
    created_at: new Date().toISOString(),
  },
  {
    id: 'pack-2',
    course_id: 'course-2',
    title: 'Old Testament History Study Pack',
    summary_content: 'Timeline and key events study materials',
    flashcard_count: 75,
    quiz_count: 8,
    created_at: new Date().toISOString(),
  },
];

// Fetchers
export async function getScrollBooks(): Promise<ScrollBook[]> {
  // TODO: Replace with actual Supabase query when scroll_books table is available
  return mockBooks;
}

export async function getScrollBook(bookId: string): Promise<ScrollBook | null> {
  return mockBooks.find(b => b.id === bookId) || null;
}

export async function getBookChapters(bookId: string): Promise<ScrollChapter[]> {
  // TODO: Replace with actual Supabase query
  return [];
}

export async function getStudyPacks(): Promise<StudyPack[]> {
  return mockStudyPacks;
}

export async function getCourseStudyPack(courseId: string): Promise<StudyPack | null> {
  return mockStudyPacks.find(p => p.course_id === courseId) || null;
}

export async function searchLibrary(query: string): Promise<LibrarySearchResult[]> {
  // Simple search implementation
  const results: LibrarySearchResult[] = [];
  
  mockBooks.forEach(book => {
    if (book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.subject.toLowerCase().includes(query.toLowerCase())) {
      results.push({
        book_id: book.id,
        title: book.title,
        excerpt: book.subtitle || '',
        relevance_score: 0.9,
        content_type: 'book',
      });
    }
  });
  
  return results;
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
