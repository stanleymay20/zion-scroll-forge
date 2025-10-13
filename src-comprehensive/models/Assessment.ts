import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './Course';

@Entity('assessments')
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  assessment_id: string;

  @Column({ type: 'uuid', name: 'course_id' })
  course_id: string;

  @Column({ 
    type: 'enum', 
    enum: ['quiz', 'project', 'peer_review', 'practical'], 
    name: 'type'
  })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'passing_score' })
  passing_score: number;

  @Column({ type: 'integer', default: 25, name: 'xp_reward' })
  xp_reward: number;

  @Column({ type: 'boolean', default: true })
  required: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Course, course => course.assessments)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}