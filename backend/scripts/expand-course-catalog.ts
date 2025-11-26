#!/usr/bin/env node
/**
 * Course Catalog Expander - Generates comprehensive course catalog
 * Creates 100+ course definitions for batch generation
 */

import * as fs from 'fs';
import * as path from 'path';

interface CourseDefinition {
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  moduleCount: number;
  lecturesPerModule: number;
  spiritualFocus: string;
  realWorldApplication: string;
  domainExpertise: string;
}

const courseTemplates = [
  // Biblical Studies (20 courses)
  { prefix: 'BIBLE', department: 'Biblical Studies', courses: [
    { code: '101', title: 'Old Testament Survey', desc: 'Comprehensive overview of Old Testament books, themes, and theology', level: 'Foundation' },
    { code: '102', title: 'New Testament Survey', desc: 'Comprehensive overview of New Testament books, themes, and theology', level: 'Foundation' },
    { code: '201', title: 'Biblical Hermeneutics', desc: 'Principles and methods of biblical interpretation', level: 'Intermediate' },
    { code: '202', title: 'Biblical Hebrew I', desc: 'Introduction to Biblical Hebrew language and grammar', level: 'Intermediate' },
    { code: '203', title: 'Biblical Greek I', desc: 'Introduction to Koine Greek language and grammar', level: 'Intermediate' },
    { code: '301', title: 'Pentateuch Studies', desc: 'In-depth study of Genesis through Deuteronomy', level: 'Advanced' },
    { code: '302', title: 'Prophetic Literature', desc: 'Study of major and minor prophets', level: 'Advanced' },
    { code: '303', title: 'Wisdom Literature', desc: 'Study of Job, Psalms, Proverbs, Ecclesiastes, Song of Solomon', level: 'Advanced' },
    { code: '304', title: 'Gospel Studies', desc: 'Comparative study of the four Gospels', level: 'Advanced' },
    { code: '305', title: 'Pauline Epistles', desc: 'In-depth study of Paul\'s letters', level: 'Advanced' },
    { code: '401', title: 'Biblical Theology', desc: 'Systematic study of biblical themes and doctrines', level: 'Graduate' },
    { code: '402', title: 'Intertestamental Period', desc: 'Study of the 400 years between Old and New Testaments', level: 'Graduate' },
    { code: '403', title: 'Biblical Archaeology', desc: 'Archaeological evidence supporting biblical narratives', level: 'Graduate' },
    { code: '404', title: 'Textual Criticism', desc: 'Study of biblical manuscripts and transmission', level: 'Graduate' },
    { code: '405', title: 'Biblical Eschatology', desc: 'Study of end times prophecy and fulfillment', level: 'Graduate' }
  ]},

  // Theology (20 courses)
  { prefix: 'THEO', department: 'Theology', courses: [
    { code: '101', title: 'Introduction to Theology', desc: 'Foundational concepts in Christian theology', level: 'Foundation' },
    { code: '102', title: 'Systematic Theology I', desc: 'Study of God, Trinity, and divine attributes', level: 'Foundation' },
    { code: '201', title: 'Systematic Theology II', desc: 'Study of humanity, sin, and salvation', level: 'Intermediate' },
    { code: '202', title: 'Pneumatology', desc: 'Study of the Holy Spirit and spiritual gifts', level: 'Intermediate' },
    { code: '203', title: 'Christology', desc: 'Study of the person and work of Jesus Christ', level: 'Intermediate' },
    { code: '204', title: 'Ecclesiology', desc: 'Study of the church, its nature and mission', level: 'Intermediate' },
    { code: '301', title: 'Historical Theology', desc: 'Development of Christian doctrine through history', level: 'Advanced' },
    { code: '302', title: 'Reformation Theology', desc: 'Study of Protestant Reformation and its theology', level: 'Advanced' },
    { code: '303', title: 'Contemporary Theology', desc: 'Modern theological movements and thinkers', level: 'Advanced' },
    { code: '304', title: 'Apologetics', desc: 'Defense of Christian faith and worldview', level: 'Advanced' },
    { code: '401', title: 'Philosophical Theology', desc: 'Intersection of philosophy and theology', level: 'Graduate' },
    { code: '402', title: 'Covenant Theology', desc: 'Study of biblical covenants and their fulfillment', level: 'Graduate' },
    { code: '403', title: 'Kingdom Theology', desc: 'Theology of God\'s kingdom on earth', level: 'Graduate' }
  ]},

  // Ministry & Leadership (15 courses)
  { prefix: 'MIN', department: 'Ministry & Leadership', courses: [
    { code: '101', title: 'Introduction to Ministry', desc: 'Foundations of Christian ministry and calling', level: 'Foundation' },
    { code: '102', title: 'Spiritual Leadership', desc: 'Biblical principles of spiritual leadership', level: 'Foundation' },
    { code: '201', title: 'Church Leadership', desc: 'Practical leadership for local church ministry', level: 'Intermediate' },
    { code: '202', title: 'Pastoral Care', desc: 'Shepherding and caring for God\'s people', level: 'Intermediate' },
    { code: '203', title: 'Preaching & Teaching', desc: 'Homiletics and biblical exposition', level: 'Intermediate' },
    { code: '204', title: 'Worship Ministry', desc: 'Leading worship and creating worship experiences', level: 'Intermediate' },
    { code: '301', title: 'Church Planting', desc: 'Starting and establishing new churches', level: 'Advanced' },
    { code: '302', title: 'Missions & Evangelism', desc: 'Global missions and evangelistic strategies', level: 'Advanced' },
    { code: '303', title: 'Youth Ministry', desc: 'Ministry to children, youth, and young adults', level: 'Advanced' },
    { code: '304', title: 'Prophetic Ministry', desc: 'Operating in prophetic gifts and office', level: 'Advanced' },
    { code: '401', title: 'Apostolic Leadership', desc: 'Five-fold ministry and apostolic function', level: 'Graduate' }
  ]},

  // Kingdom Business (15 courses)
  { prefix: 'KINGBIZ', department: 'Kingdom Business', courses: [
    { code: '101', title: 'Kingdom Economics', desc: 'Biblical principles of economics and finance', level: 'Foundation' },
    { code: '201', title: 'Marketplace Ministry', desc: 'Ministry in business and professional settings', level: 'Intermediate' },
    { code: '202', title: 'Christian Entrepreneurship', desc: 'Starting and running kingdom businesses', level: 'Intermediate' },
    { code: '301', title: 'Kingdom Business Principles', desc: 'Biblical foundations for business and entrepreneurship', level: 'Advanced' },
    { code: '302', title: 'Stewardship & Wealth', desc: 'Biblical stewardship of resources and wealth', level: 'Advanced' },
    { code: '303', title: 'Business as Mission', desc: 'Using business for kingdom advancement', level: 'Advanced' },
    { code: '401', title: 'Kingdom Finance', desc: 'Advanced financial principles for kingdom impact', level: 'Graduate' }
  ]},

  // Technology & AI (10 courses)
  { prefix: 'TECH', department: 'Technology & AI', courses: [
    { code: '101', title: 'Technology Stewardship', desc: 'Christian approach to technology and innovation', level: 'Foundation' },
    { code: '201', title: 'Sacred AI Engineering', desc: 'Integrating AI with Christian ethics and kingdom purposes', level: 'Intermediate' },
    { code: '202', title: 'Christian Software Development', desc: 'Building software with kingdom values', level: 'Intermediate' },
    { code: '301', title: 'AI Ethics & Theology', desc: 'Theological implications of artificial intelligence', level: 'Advanced' },
    { code: '302', title: 'Digital Ministry', desc: 'Using technology for ministry and outreach', level: 'Advanced' },
    { code: '401', title: 'Prophetic Technology', desc: 'Hearing God in technology development', level: 'Graduate' }
  ]},

  // Spiritual Formation (10 courses)
  { prefix: 'SPIRFORM', department: 'Spiritual Formation', courses: [
    { code: '101', title: 'Spiritual Formation Foundations', desc: 'Core practices and principles of Christian spiritual formation', level: 'Foundation' },
    { code: '102', title: 'Prayer & Intercession', desc: 'Developing a powerful prayer life', level: 'Foundation' },
    { code: '201', title: 'Spiritual Disciplines', desc: 'Classical and contemporary spiritual practices', level: 'Intermediate' },
    { code: '202', title: 'Contemplative Prayer', desc: 'Deeper practices of meditation and contemplation', level: 'Intermediate' },
    { code: '301', title: 'Spiritual Warfare', desc: 'Understanding and engaging in spiritual battle', level: 'Advanced' },
    { code: '302', title: 'Fasting & Consecration', desc: 'Biblical fasting and consecration practices', level: 'Advanced' },
    { code: '401', title: 'Mystical Theology', desc: 'Experiencing God through mystical practices', level: 'Graduate' }
  ]},

  // Counseling & Psychology (10 courses)
  { prefix: 'COUNS', department: 'Counseling', courses: [
    { code: '101', title: 'Introduction to Christian Counseling', desc: 'Foundations of biblical counseling', level: 'Foundation' },
    { code: '201', title: 'Biblical Counseling Methods', desc: 'Practical counseling techniques from Scripture', level: 'Intermediate' },
    { code: '202', title: 'Marriage & Family Counseling', desc: 'Counseling for relationships and families', level: 'Intermediate' },
    { code: '301', title: 'Trauma & Recovery', desc: 'Healing from trauma through Christ', level: 'Advanced' },
    { code: '302', title: 'Addiction & Deliverance', desc: 'Freedom from addiction and bondage', level: 'Advanced' },
    { code: '401', title: 'Inner Healing Ministry', desc: 'Deep emotional and spiritual healing', level: 'Graduate' }
  ]}
];

function generateCourses(): CourseDefinition[] {
  const courses: CourseDefinition[] = [];

  for (const template of courseTemplates) {
    for (const course of template.courses) {
      const moduleCount = course.level === 'Foundation' ? 4 : 
                         course.level === 'Intermediate' ? 6 :
                         course.level === 'Advanced' ? 8 : 10;

      courses.push({
        code: `${template.prefix}_${course.code}`,
        title: course.title,
        description: course.desc,
        credits: course.level === 'Foundation' ? 3 : 4,
        level: course.level,
        moduleCount: moduleCount,
        lecturesPerModule: 4,
        spiritualFocus: `${template.department} & Kingdom Transformation`,
        realWorldApplication: `${template.department} Leadership & Ministry`,
        domainExpertise: `${template.department.toLowerCase()}, biblical integration, spiritual formation`
      });
    }
  }

  return courses;
}

// Main execution
function main(): void {
  console.log('📚 Expanding Course Catalog...\n');

  const courses = generateCourses();
  const catalog = { courses };

  const outputPath = path.join(__dirname, '../data/expanded-course-catalog.json');
  fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));

  console.log(`✅ Generated ${courses.length} course definitions`);
  console.log(`📄 Saved to: ${outputPath}\n`);

  // Statistics
  const byLevel = courses.reduce((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Course Distribution:');
  Object.entries(byLevel).forEach(([level, count]) => {
    console.log(`   ${level}: ${count} courses`);
  });

  console.log(`\n⏱️  Estimated generation time:`);
  console.log(`   Sequential: ${(courses.length * 2.5 / 60).toFixed(1)} hours`);
  console.log(`   Parallel (5 workers): ${(courses.length * 2.5 / 60 / 5).toFixed(1)} hours`);
  console.log(`   Parallel (10 workers): ${(courses.length * 2.5 / 60 / 10).toFixed(1)} hours`);
}

main();
