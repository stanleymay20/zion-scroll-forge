#!/usr/bin/env ts-node

/**
 * Video Content Generation Script
 * Generates AI avatar videos for production-ready courses
 */

import { VideoAvatarService } from '../src/services/VideoAvatarService';
import { VideoProductionService } from '../src/services/VideoProductionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CourseToGenerate {
  courseCode: string;
  courseName: string;
  modules: number;
  lecturesPerModule: number;
}

const PRODUCTION_COURSES: CourseToGenerate[] = [
  {
    courseCode: 'SPIRFORM_101',
    courseName: 'Spiritual Formation Foundations',
    modules: 8,
    lecturesPerModule: 4
  },
  {
    courseCode: 'SACREDAI_201',
    courseName: 'Sacred AI Engineering',
    modules: 10,
    lecturesPerModule: 4
  },
  {
    courseCode: 'KINGBIZ_301',
    courseName: 'Kingdom Business Principles',
    modules: 12,
    lecturesPerModule: 4
  },
  {
    courseCode: 'BIBWORLD_201',
    courseName: 'Biblical Worldview',
    modules: 10,
    lecturesPerModule: 4
  }
];

async function generateVideosForCourse(course: CourseToGenerate): Promise<void> {
  console.log(`\n🎥 Generating videos for ${course.courseName}...`);
  
  const videoAvatarService = new VideoAvatarService();
  const videoProductionService = new VideoProductionService();
  
  let totalGenerated = 0;
  
  for (let moduleNum = 1; moduleNum <= course.modules; moduleNum++) {
    console.log(`  📚 Module ${moduleNum}/${course.modules}`);
    
    for (let lectureNum = 1; lectureNum <= course.lecturesPerModule; lectureNum++) {
      try {
        // Read lecture script from filesystem
        const scriptPath = `courses/COURSE_${course.courseCode}/module${moduleNum}/lecture${lectureNum}.md`;
        
        // Generate video using AI avatar
        const videoResult = await videoAvatarService.generateVideo({
          scriptPath,
          courseCode: course.courseCode,
          moduleNumber: moduleNum,
          lectureNumber: lectureNum,
          provider: 'heygen', // or 'synthesia', 'd-id'
          avatarStyle: 'professional-professor',
          voiceId: 'default-male-1'
        });
        
        // Process and store video
        await videoProductionService.processVideo({
          videoId: videoResult.videoId,
          courseCode: course.courseCode,
          moduleNumber: moduleNum,
          lectureNumber: lectureNum,
          generateCaptions: true,
          generateThumbnail: true
        });
        
        totalGenerated++;
        console.log(`    ✅ Lecture ${lectureNum} video generated`);
        
      } catch (error) {
        console.error(`    ❌ Failed to generate lecture ${lectureNum}:`, error.message);
      }
    }
  }
  
  console.log(`✅ ${course.courseName}: ${totalGenerated} videos generated`);
}

async function main(): Promise<void> {
  console.log('🚀 Starting Video Content Generation for Production Courses\n');
  console.log('=' .repeat(60));
  
  let totalVideos = 0;
  
  for (const course of PRODUCTION_COURSES) {
    await generateVideosForCourse(course);
    totalVideos += course.modules * course.lecturesPerModule;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎉 Video Generation Complete!`);
  console.log(`📊 Total Videos Generated: ${totalVideos}`);
  console.log(`📚 Courses Ready: ${PRODUCTION_COURSES.length}`);
  
  await prisma.$disconnect();
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Video generation failed:', error);
      process.exit(1);
    });
}

export { main as generateVideoContent };
