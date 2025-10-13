import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Lecture } from './Lecture';
import { Assessment } from './Assessment';
import { Enrollment } from './Enrollment';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  course_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ['ScrollMedicine', 'ScrollAI', 'ScrollGovernance', 'ScrollBusiness', 'ScrollEngineering'],
    name: 'scroll_field'
  })
  scroll_field: string;

  @Column({ 
    type: 'enum', 
    enum: ['basic', 'intermediate', 'advanced'], 
    default: 'basic',
    name: 'difficulty_level'
  })
  difficulty_level: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0, name: 'xp_multiplier' })
  xp_multiplier: number;

  @Column({ type: 'json', nullable: true })
  prerequisites: string[];

  @Column({ type: 'json' })
  learning_objectives: string[];

  @Column({ type: 'integer', default: 0, name: 'estimated_hours' })
  estimated_hours: number;

  @Column({ type: 'boolean', default: true, name: 'gpt_tutor_enabled' })
  gpt_tutor_enabled: boolean;

  @Column({ type: 'boolean', default: false, name: 'final_project_required' })
  final_project_required: boolean;

  @Column({ 
    type: 'enum', 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  })
  status: string;

  @Column({ type: 'uuid', name: 'created_by' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relationships
  @OneToMany(() => Lecture, lecture => lecture.course)
  lectures: Lecture[];

  @OneToMany(() => Assessment, assessment => assessment.course)
  assessments: Assessment[];

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];
}