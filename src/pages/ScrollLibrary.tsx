import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, BookOpen, Search, Library, GraduationCap, 
  Star, FileText, Brain, Sparkles, Download, BookMarked,
  Layers, ChevronRight, Filter, BookText
} from "lucide-react";
import { useScrollBooks, useStudyPacks, useLibrarySearch, ScrollBook, StudyPack } from "@/hooks/useScrollLibrary";

console.info("✝️ ScrollLibrary — Christ governs all knowledge and wisdom");

const FACULTIES = [
  "All Faculties",
  "Divine Technology",
  "Scroll Theology",
  "Kingdom Economics",
  "Prophetic Intelligence",
  "ScrollMedicine",
  "Scroll Law",
  "Sacred Arts & Worship",
  "Scroll Education & Leadership",
  "Scroll Engineering & AI",
  "ScrollMedia & Communication",
  "Kingdom Architecture",
  "Edenic Science",
  "GeoProphetic Intelligence",
  "Prophetic Law & Governance",
  "Scroll AI",
  "Scroll Culture & Arts",
  "Scroll Economy",
  "Health",
  "Finance",
  "Leadership",
  "Prophetic Technology",
  "Ethic Science",
];

function getLevelColor(level: string): string {
  switch (level) {
    case 'beginner': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'intermediate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'advanced': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
}

function BookCard({ book, onRead }: { book: ScrollBook; onRead: (id: string) => void }) {
  return (
    <Card 
      className="hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={() => onRead(book.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={getLevelColor(book.level)}>
            {book.level}
          </Badge>
          {book.quality_score && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{(book.quality_score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
        <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors line-clamp-2">
          {book.title}
        </CardTitle>
        {book.subtitle && (
          <CardDescription className="line-clamp-2">
            {book.subtitle}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{book.subject}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>{book.faculty}</span>
        </div>

        {(book.chapters || book.pages) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {book.chapters && (
              <span className="flex items-center gap-1">
                <BookText className="h-3 w-3" />
                {book.chapters} chapters
              </span>
            )}
            {book.pages && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {book.pages} pages
              </span>
            )}
          </div>
        )}
        
        {book.theological_alignment && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Theological Alignment</span>
              <span>{(book.theological_alignment * 100).toFixed(0)}%</span>
            </div>
            <Progress value={book.theological_alignment * 100} className="h-1" />
          </div>
        )}
        
        <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
          Read Book
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function StudyPackCard({ pack }: { pack: StudyPack }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{pack.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{pack.faculty}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pack.summary_content && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {pack.summary_content}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Brain className="h-4 w-4" />
            <span>{pack.flashcard_count} flashcards</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{pack.quiz_count} quizzes</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button size="sm" className="flex-1">
            Study Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ScrollLibrary() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties");
  const { data: books, isLoading: booksLoading } = useScrollBooks();
  const { data: studyPacks, isLoading: packsLoading } = useStudyPacks();
  const { data: searchResults, isLoading: searchLoading } = useLibrarySearch(searchQuery);

  const isLoading = booksLoading || packsLoading;

  const handleReadBook = (bookId: string) => {
    navigate(`/scroll-library/book/${bookId}`);
  };

  // Filter books by faculty
  const filteredBooks = books?.filter(book => 
    selectedFaculty === "All Faculties" || book.faculty === selectedFaculty
  ) || [];

  // Filter study packs by faculty
  const filteredStudyPacks = studyPacks?.filter(pack =>
    selectedFaculty === "All Faculties" || pack.faculty === selectedFaculty
  ) || [];

  // Get unique faculties from books for stats
  const uniqueFaculties = new Set(books?.map(b => b.faculty) || []);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Library className="h-8 w-8 text-primary" />
          ScrollLibrary
        </h1>
        <p className="text-muted-foreground">
          AI-generated textbooks, study materials, and learning resources curated under Christ's governance
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books, chapters, and study materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>
        
        <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Faculty" />
          </SelectTrigger>
          <SelectContent>
            {FACULTIES.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && searchResults && searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {result.content_type === 'book' ? (
                      <BookOpen className="h-5 w-5 text-primary" />
                    ) : (
                      <Layers className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{result.excerpt}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{result.content_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{books?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Textbooks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studyPacks?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Study Packs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <GraduationCap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueFaculties.size}</p>
                <p className="text-sm text-muted-foreground">Faculties</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Theological Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="books" className="space-y-6">
        <TabsList>
          <TabsTrigger value="books" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Textbooks ({filteredBooks.length})
          </TabsTrigger>
          <TabsTrigger value="study-packs" className="gap-2">
            <Layers className="h-4 w-4" />
            Study Packs ({filteredStudyPacks.length})
          </TabsTrigger>
          <TabsTrigger value="featured" className="gap-2">
            <Star className="h-4 w-4" />
            Featured
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onRead={handleReadBook} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {selectedFaculty !== "All Faculties" 
                    ? `No textbooks available for ${selectedFaculty}` 
                    : "No textbooks available yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try selecting a different faculty or check back later
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="study-packs" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudyPacks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudyPacks.map((pack) => (
                <StudyPackCard key={pack.id} pack={pack} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {selectedFaculty !== "All Faculties"
                    ? `No study packs available for ${selectedFaculty}`
                    : "No study packs available yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Study packs include flashcards, quizzes, and summaries for courses
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Featured Content
              </CardTitle>
              <CardDescription>
                Hand-picked resources recommended by ScrollUniversity faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="flex items-center gap-3 mb-3">
                    <BookMarked className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">Foundations of Biblical Theology</p>
                      <p className="text-sm text-muted-foreground">Essential reading for new students</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Start Reading
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <GraduationCap className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-semibold">Divine Algorithm: AI Ethics</p>
                      <p className="text-sm text-muted-foreground">Christ-centered technology</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    View Guide
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-semibold">Kingdom Economics</p>
                      <p className="text-sm text-muted-foreground">Biblical wealth principles</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Explore
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-500/5 to-yellow-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="font-semibold">Servant Leadership</p>
                      <p className="text-sm text-muted-foreground">Leading like Christ</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Generation Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Powered by ScrollLibrary AI</h3>
              <p className="text-sm text-muted-foreground">
                All textbooks and study materials are generated by our multi-agent AI system including 
                ScrollAuthorGPT, ScrollProfessorGPT, ScrollScribeGPT, and validated by ScrollIntegritySeal 
                for theological accuracy and academic excellence. Currently featuring <strong>{books?.length || 0} textbooks</strong> across <strong>{uniqueFaculties.size} faculties</strong> with <strong>{studyPacks?.length || 0} study packs</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}