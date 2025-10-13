import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './Course';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  enrollment_id: string;

  @Column({ type: 'uuid', name: 'course_id' })
  course_id: string;

  @Column({ type: 'uuid', name: 'student_id' })
  student_id: string;

  @Column({ type: 'timestamp', name: 'enrollment_date' })
  enrollment_date: Date;

  @Column({ 
    type: 'enum', 
    enum: ['enrolled', 'in_progress', 'completed', 'dropped'], 
    default: 'enrolled' 
  })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'progress_percentage' })
  progress_percentage: number;

  @Column({ type: 'uuid', nullable: true, name: 'current_lecture' })
  current_lecture: string;

  @Column({ type: 'json', nullable: true, name: 'completed_lectures' })
  completed_lectures: string[];

  @Column({ type: 'json', nullable: true, name: 'completed_assessments' })
  completed_assessments: any[];

  @Column({ type: 'integer', default: 0, name: 'total_xp_earned' })
  total_xp_earned: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_activity' })
  last_activity: Date;

  @Column({ type: 'json', nullable: true, name: 'mentor_alerts' })
  mentor_alerts: string[];

  @Column({ type: 'integer', default: 0, name: 'tutoring_sessions' })
  tutoring_sessions: number;

  @Column({ type: 'timestamp', nullable: true, name: 'completion_date' })
  completion_date: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Course, course => course.enrollments)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}