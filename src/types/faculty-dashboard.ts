/**
 * Type Definitions for Faculty Dashboard
 * Academic Year Automation System - Faculty Operations
 */

// Teaching Load Types
export interface TeachingLoadAnalysis {
  facultyId: string;
  currentLoad: {
    courses: number;
    students: number;
    credits: number;
    workloadHours: number;
  };
  capacity: {
    maxCourses: number;
    maxStudents: number;
    maxCredits: number;
    maxWorkloadHours: number;
  };
  utilization: {
    courseUtilization: number;
    studentUtilization: number;
    creditUtilization: number;
    workloadUtilization: number;
  };
  availability: {
    totalHours: number;
    scheduledHours: number;
    availableHours: number;
  };
}

export interface CourseAssignment {
  assignmentId: string;
  facultyId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  role: 'primary_instructor' | 'co_instructor' | 'teaching_assistant' | 'lab_instructor';
  credits: number;
  estimatedStudents: number;
  workloadHours: number;
  semesterId: string;
  semesterName: string;
}

// Content Generation Types
export interface LecturePlan {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  learningObjectives: string[];
  outline: LectureSection[];
  teachingMethods: string[];
  assessmentStrategies: string[];
  spiritualFormationElements: SpiritualFormationElement[];
  estimatedDuration: number;
  materials: string[];
  prerequisites: string[];
  createdAt: Date;
  createdBy: string;
}

export interface LectureSection {
  sectionNumber: number;
  title: string;
  content: string;
  duration: number;
  activities: string[];
  keyPoints: string[];
}

export interface SpiritualFormationElement {
  type: 'scripture' | 'prayer' | 'reflection' | 'application';
  content: string;
  timing: string;
  purpose: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  moduleId?: string;
  assessmentType: 'quiz' | 'exam' | 'assignment' | 'project' | 'discussion';
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  rubric: AssessmentRubric;
  totalPoints: number;
  timeLimit?: number;
  instructions: string;
  spiritualReflection?: string;
  createdAt: Date;
  createdBy: string;
}

export interface AssessmentQuestion {
  questionNumber: number;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'practical';
  question: string;
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  rubricCriteria?: string[];
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface AssessmentRubric {
  criteria: RubricCriterion[];
  gradingScale: GradingScale;
}

export interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export interface GradingScale {
  type: 'percentage' | 'points' | 'letter';
  ranges: GradeRange[];
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
}

// Grading Types
export interface GradingSubmission {
  submissionId: string;
  studentId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseName: string;
  submissionContent: string;
  submittedAt: Date;
  status: 'pending' | 'grading' | 'graded' | 'needs_review';
  score?: number;
  maxPoints: number;
  confidenceScore?: number;
  needsHumanReview?: boolean;
}

export interface GradingResult {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  score: number;
  maxPoints: number;
  percentage: number;
  letterGrade?: string;
  confidenceScore: number;
  needsHumanReview: boolean;
  criteriaScores: CriteriaScore[];
  feedback: string;
  detailedFeedback: DetailedFeedback[];
  gradedAt: Date;
  gradedBy: string;
  reviewReason?: string;
}

export interface CriteriaScore {
  criterionName: string;
  score: number;
  maxPoints: number;
  feedback: string;
  confidence: number;
}

export interface DetailedFeedback {
  section: string;
  comment: string;
  type: 'strength' | 'weakness' | 'suggestion';
}

// Student Analytics Types
export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  enrollmentDate: Date;
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  performance: {
    currentGrade: number;
    letterGrade: string;
    assignments: {
      completed: number;
      total: number;
      averageScore: number;
    };
    quizzes: {
      completed: number;
      total: number;
      averageScore: number;
    };
    exams: {
      completed: number;
      total: number;
      averageScore: number;
    };
  };
  engagement: {
    participationScore: number;
    discussionPosts: number;
    questionsAsked: number;
    officeHoursAttended: number;
  };
  progress: {
    modulesCompleted: number;
    totalModules: number;
    percentageComplete: number;
    onTrack: boolean;
  };
  riskLevel: 'low' | 'medium' | 'high';
  interventionRecommended: boolean;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  courseCode: string;
  semesterId: string;
  semesterName: string;
  enrollment: {
    total: number;
    active: number;
    dropped: number;
    withdrawn: number;
  };
  performance: {
    averageGrade: number;
    medianGrade: number;
    gradeDistribution: Record<string, number>;
    passRate: number;
  };
  engagement: {
    averageAttendance: number;
    averageParticipation: number;
    discussionActivity: number;
  };
  assessments: {
    total: number;
    averageScore: number;
    completionRate: number;
  };
  atRiskStudents: number;
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
