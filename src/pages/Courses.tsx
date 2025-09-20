import { useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, Star, Clock, Users, Play, BookOpen,
  Heart, Brain, Microscope, Briefcase, Coins
} from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    id: 1,
    title: "Prophetic Intelligence Fundamentals",
    faculty: "GeoProphetic Intelligence",
    instructor: "Dr. Samuel Scroll",
    duration: "8 weeks",
    students: 2847,
    rating: 4.9,
    level: "Beginner",
    price: "250 ScrollCoins",
    description: "Master the art of receiving and interpreting divine insights for global transformation.",
    image: "/api/placeholder/300/200",
    tags: ["Prophecy", "Intelligence", "Spiritual Gifts"],
    icon: Brain,
    featured: true
  },
  {
    id: 2,
    title: "ScrollMedicine: Divine Healing Principles",
    faculty: "ScrollMedicine",
    instructor: "Dr. Miriam Healer",
    duration: "12 weeks",
    students: 1923,
    rating: 4.8,
    level: "Intermediate",
    price: "400 ScrollCoins",
    description: "Integrate medical science with supernatural healing through Christ's authority.",
    image: "/api/placeholder/300/200",
    tags: ["Medicine", "Healing", "Miracles"],
    icon: Heart,
    featured: true
  },
  {
    id: 3,
    title: "Edenic Science: Creation-Based Research",
    faculty: "Edenic Science",
    instructor: "Prof. Adam Researcher",
    duration: "10 weeks",
    students: 1564,
    rating: 4.7,
    level: "Advanced",
    price: "350 ScrollCoins",
    description: "Explore scientific discovery through the lens of divine creation and original design.",
    image: "/api/placeholder/300/200",
    tags: ["Science", "Creation", "Research"],
    icon: Microscope,
    featured: false
  },
  {
    id: 4,
    title: "Kingdom Economics & ScrollCoin Theory",
    faculty: "Scroll Economy",
    instructor: "Dr. Solomon Wealth",
    duration: "6 weeks",
    students: 3241,
    rating: 4.9,
    level: "Beginner",
    price: "200 ScrollCoins",
    description: "Master biblical wealth principles and the revolutionary ScrollCoin economic system.",
    image: "/api/placeholder/300/200",
    tags: ["Economics", "Wealth", "Kingdom Principles"],
    icon: Coins,
    featured: true
  },
  {
    id: 5,
    title: "Prophetic Law & Governance",
    faculty: "Prophetic Law",
    instructor: "Justice David Righteous",
    duration: "14 weeks",
    students: 987,
    rating: 4.6,
    level: "Advanced",
    price: "500 ScrollCoins",
    description: "Learn to establish just governance systems based on divine law and prophetic insight.",
    image: "/api/placeholder/300/200",
    tags: ["Law", "Governance", "Justice"],
    icon: Briefcase,
    featured: false
  },
  {
    id: 6,
    title: "Scroll AI: Consciousness-Level Computing",
    faculty: "Scroll AI",
    instructor: "Dr. Neural Network",
    duration: "16 weeks",
    students: 2156,
    rating: 4.8,
    level: "Advanced",
    price: "600 ScrollCoins",
    description: "Build AI systems that operate at consciousness levels with Christ-centered ethics.",
    image: "/api/placeholder/300/200",
    tags: ["AI", "Consciousness", "Technology"],
    icon: Brain,
    featured: true
  }
];

const faculties = [
  "All Faculties",
  "ScrollMedicine",
  "Prophetic Law",
  "Scroll Economy", 
  "Edenic Science",
  "GeoProphetic Intelligence",
  "Scroll Theology",
  "Scroll AI",
  "Scroll Engineering",
  "Scroll Arts",
  "Scroll Business",
  "Scroll Education",
  "Scroll Communications"
];

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("All Faculties");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = selectedFaculty === "All Faculties" || course.faculty === selectedFaculty;
    const matchesLevel = selectedLevel === "All Levels" || course.level === selectedLevel;
    
    return matchesSearch && matchesFaculty && matchesLevel;
  });

  return (
    <PageTemplate 
      title="Course Catalog"
      description="Explore 10,000+ courses across 12 Supreme Scroll Faculties"
      actions={
        <div className="flex space-x-2">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            My Courses
          </Button>
          <Button>
            <Star className="h-4 w-4 mr-2" />
            Wishlist
          </Button>
        </div>
      }
    >
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(faculty => (
                    <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Courses */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.filter(course => course.featured).map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <course.icon className="h-12 w-12 text-primary" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="mb-2">{course.faculty}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.level}</Badge>
                    <span className="font-semibold text-primary">{course.price}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Courses */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.filter(course => !course.featured).map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <course.icon className="h-12 w-12 text-primary" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="mb-2">{course.faculty}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.level}</Badge>
                    <span className="font-semibold text-primary">{course.price}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Course Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>ScrollUniversity Course Statistics</CardTitle>
          <CardDescription>
            The most comprehensive Christ-centered educational platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10,000+</div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Supreme Faculties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50,000+</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">99.2%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}