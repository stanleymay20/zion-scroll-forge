import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSimple() {
  try {
    console.log('Testing database connection...');
    
    // Test faculty creation
    let faculty = await prisma.faculty.findFirst({
      where: { name: 'Test Faculty' }
    });
    
    if (!faculty) {
      faculty = await prisma.faculty.create({
        data: {
          name: 'Test Faculty',
          description: 'Test Description',
          isActive: true
        }
      });
      console.log('✅ Faculty created:', faculty.id);
    } else {
      console.log('✅ Faculty found:', faculty.id);
    }
    
    // Test course creation
    let course = await prisma.course.findUnique({
      where: { code: 'TEST_101' }
    });
    
    if (!course) {
      course = await prisma.course.create({
        data: {
          code: 'TEST_101',
          title: 'Test Course',
          description: 'Test Description',
          facultyId: faculty.id,
          credits: 3,
          level: 'BEGINNER',
          isActive: true
        }
      });
      console.log('✅ Course created:', course.id);
    } else {
      console.log('✅ Course found:', course.id);
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimple();
