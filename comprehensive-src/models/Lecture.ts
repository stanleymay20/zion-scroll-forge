import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './Course';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn('uuid')
  lecture_id: string;

  @Column({ type: 'uuid', name: 'course_id' })
  course_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true, name: 'video_url' })
  video_url: string;

  @Column({ type: 'text', nullable: true, name: 'transcript_md' })
  transcript_md: string;

  @Column({ type: 'json', nullable: true })
  resources: string[];

  @Column({ type: 'integer', default: 10, name: 'xp_reward' })
  xp_reward: number;

  @Column({ type: 'integer', name: 'order' })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Course, course => course.lectures)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}