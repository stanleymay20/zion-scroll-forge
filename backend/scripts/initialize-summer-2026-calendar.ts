#!/usr/bin/env ts-node
/**
 * Initialize Summer 2026 Academic Calendar
 * 
 * This script creates the academic year and semester structure for
 * ScrollUniversity's inaugural Summer 2026 launch.
 * 
 * Run: npx ts-node backend/scripts/initialize-summer-2026-calendar.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeSummer2026Calendar() {
  console.log('🎓 Initializing Summer 2026 Academic Calendar...\n');

  try {
    // Create Academic Year 2025-2026
    console.log('📅 Creating Academic Year 2025-2026...');
    const academicYear = await prisma.academicYear.create({
      data: {
        name: '2025-2026 Academic Year',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-05-31'),
        calendarType: 'trimester',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Academic Year created: ${academicYear.id}\n`);

    // Create Summer 2026 Semester (Inaugural)
    console.log('🌞 Creating Summer 2026 Semester...');
    const summer2026 = await prisma.semester.create({
      data: {
        academicYearId: academicYear.id,
        name: 'Summer 2026',
        type: 'summer',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-08-15'),
        registrationStart: new Date('2026-05-01'),
        registrationEnd: new Date('2026-05-25'),
        addDropDeadline: new Date('2026-06-08'),
        withdrawalDeadline: new Date('2026-07-20'),
        finalExamsStart: new Date('2026-08-10'),
        finalExamsEnd: new Date('2026-08-14'),
        gradesDue: new Date('2026-08-17'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Summer 2026 Semester created: ${summer2026.id}\n`);

    // Create Fall 2026 Semester
    console.log('🍂 Creating Fall 2026 Semester...');
    const fall2026 = await prisma.semester.create({
      data: {
        academicYearId: academicYear.id,
        name: 'Fall 2026',
        type: 'fall',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-20'),
        registrationStart: new Date('2026-07-01'),
        registrationEnd: new Date('2026-08-25'),
        addDropDeadline: new Date('2026-09-15'),
        withdrawalDeadline: new Date('2026-11-15'),
        finalExamsStart: new Date('2026-12-13'),
        finalExamsEnd: new Date('2026-12-20'),
        gradesDue: new Date('2026-12-27'),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Fall 2026 Semester created: ${fall2026.id}\n`);

    // Create Spring 2027 Semester
    console.log('🌸 Creating Spring 2027 Semester...');
    const spring2027 = await prisma.semester.create({
      data: {
        academicYearId: academicYear.id,
        name: 'Spring 2027',
        type: 'spring',
        startDate: new Date('2027-01-11'),
        endDate: new Date('2027-05-15'),
        registrationStart: new Date('2026-11-01'),
        registrationEnd: new Date('2027-01-05'),
        addDropDeadline: new Date('2027-01-25'),
        withdrawalDeadline: new Date('2027-04-15'),
        finalExamsStart: new Date('2027-05-08'),
        finalExamsEnd: new Date('2027-05-15'),
        gradesDue: new Date('2027-05-22'),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Spring 2027 Semester created: ${spring2027.id}\n`);

    // Create Key Academic Events
    console.log('📌 Creating Key Academic Events...\n');

    const events = [
      // Admissions Events
      {
        title: 'Admissions Open for Summer 2026',
        type: 'admissions',
        startDate: new Date('2026-01-05'),
        endDate: new Date('2026-01-05'),
        semesterId: summer2026.id,
        description: 'Applications open for Summer 2026 inaugural semester',
        isAllDay: true,
      },
      {
        title: 'Application Deadline - Summer 2026',
        type: 'deadline',
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-05-15'),
        semesterId: summer2026.id,
        description: 'Final deadline for Summer 2026 applications',
        isAllDay: true,
      },
      {
        title: 'Admission Decisions Released',
        type: 'admissions',
        startDate: new Date('2026-05-20'),
        endDate: new Date('2026-05-20'),
        semesterId: summer2026.id,
        description: 'Admission decisions sent to applicants',
        isAllDay: true,
      },
      {
        title: 'Enrollment Confirmation Deadline',
        type: 'deadline',
        startDate: new Date('2026-05-25'),
        endDate: new Date('2026-05-25'),
        semesterId: summer2026.id,
        description: 'Students must confirm enrollment by this date',
        isAllDay: true,
      },
      // Orientation
      {
        title: 'New Student Orientation Week',
        type: 'orientation',
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-05-30'),
        semesterId: summer2026.id,
        description: 'Welcome and orientation for new students',
        isAllDay: true,
      },
      // Academic Events
      {
        title: 'First Day of Classes - Summer 2026',
        type: 'academic',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-01'),
        semesterId: summer2026.id,
        description: 'Inaugural first day of classes at ScrollUniversity!',
        isAllDay: true,
      },
      {
        title: 'Add/Drop Deadline',
        type: 'deadline',
        startDate: new Date('2026-06-08'),
        endDate: new Date('2026-06-08'),
        semesterId: summer2026.id,
        description: 'Last day to add or drop courses without penalty',
        isAllDay: true,
      },
      {
        title: 'Midterm Exams',
        type: 'exam',
        startDate: new Date('2026-07-06'),
        endDate: new Date('2026-07-10'),
        semesterId: summer2026.id,
        description: 'Midterm examination period',
        isAllDay: true,
      },
      {
        title: 'Course Withdrawal Deadline',
        type: 'deadline',
        startDate: new Date('2026-07-20'),
        endDate: new Date('2026-07-20'),
        semesterId: summer2026.id,
        description: 'Last day to withdraw from courses',
        isAllDay: true,
      },
      {
        title: 'Final Exams',
        type: 'exam',
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-08-14'),
        semesterId: summer2026.id,
        description: 'Final examination period',
        isAllDay: true,
      },
      {
        title: 'Last Day of Classes - Summer 2026',
        type: 'academic',
        startDate: new Date('2026-08-15'),
        endDate: new Date('2026-08-15'),
        semesterId: summer2026.id,
        description: 'End of Summer 2026 semester',
        isAllDay: true,
      },
      {
        title: 'Grades Due',
        type: 'deadline',
        startDate: new Date('2026-08-17'),
        endDate: new Date('2026-08-17'),
        semesterId: summer2026.id,
        description: 'Faculty deadline for submitting final grades',
        isAllDay: true,
      },
      // Fall 2026 Registration
      {
        title: 'Fall 2026 Registration Opens',
        type: 'registration',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-01'),
        semesterId: fall2026.id,
        description: 'Registration opens for Fall 2026 semester',
        isAllDay: true,
      },
    ];

    for (const event of events) {
      const created = await prisma.academicEvent.create({ data: event });
      console.log(`  ✅ ${event.title}`);
    }

    console.log('\n🎉 Academic Calendar Initialization Complete!\n');
    console.log('📊 Summary:');
    console.log(`  - Academic Year: ${academicYear.name}`);
    console.log(`  - Semesters Created: 3 (Summer 2026, Fall 2026, Spring 2027)`);
    console.log(`  - Events Created: ${events.length}`);
    console.log(`  - Launch Date: June 1, 2026`);
    console.log(`  - Days Until Launch: ${Math.ceil((new Date('2026-06-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days\n`);

    console.log('🚀 Next Steps:');
    console.log('  1. Generate pilot courses');
    console.log('  2. Set up admissions portal');
    console.log('  3. Begin marketing campaign');
    console.log('  4. Train staff and faculty\n');

    console.log('"Commit to the LORD whatever you do, and he will establish your plans." - Proverbs 16:3\n');

  } catch (error) {
    console.error('❌ Error initializing calendar:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeSummer2026Calendar()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
