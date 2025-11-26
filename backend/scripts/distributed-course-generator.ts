#!/usr/bin/env node
/**
 * Distributed Course Generator - Splits catalog for multi-machine generation
 * Enables 100+ parallel workers across multiple machines
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

class DistributedCourseGenerator {
  private catalogPath: string;
  private outputDir: string;

  constructor() {
    this.catalogPath = path.join(__dirname, '../data/expanded-course-catalog.json');
    this.outputDir = path.join(__dirname, '../data/distributed-batches');
  }

  splitCatalog(batchSize: number): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🌐 DISTRIBUTED COURSE GENERATION SETUP`);
    console.log(`${'='.repeat(80)}\n`);

    // Load catalog
    const catalog = JSON.parse(fs.readFileSync(this.catalogPath, 'utf-8'));
    const courses: CourseDefinition[] = catalog.courses;

    console.log(`📚 Total courses: ${courses.length}`);
    console.log(`📦 Batch size: ${batchSize} courses per machine`);

    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Split into batches
    const batches: CourseDefinition[][] = [];
    for (let i = 0; i < courses.length; i += batchSize) {
      batches.push(courses.slice(i, i + batchSize));
    }

    console.log(`🖥️  Total batches: ${batches.length}\n`);

    // Save each batch
    batches.forEach((batch, index) => {
      const batchNum = index + 1;
      const batchFile = path.join(this.outputDir, `batch-${batchNum}.json`);
      
      fs.writeFileSync(batchFile, JSON.stringify({ courses: batch }, null, 2));
      
      console.log(`✅ Batch ${batchNum}: ${batch.length} courses`);
      console.log(`   File: batch-${batchNum}.json`);
      console.log(`   Courses: ${batch[0].code} to ${batch[batch.length - 1].code}`);
    });

    // Generate instructions
    this.generateInstructions(batches.length, batchSize);

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ DISTRIBUTED BATCHES READY`);
    console.log(`${'='.repeat(80)}\n`);
  }

  private generateInstructions(batchCount: number, batchSize: number): void {
    const instructions = `# Distributed Course Generation Instructions

## Setup

You have ${batchCount} batches ready for distributed generation.
Each batch contains ~${batchSize} courses.

## Deployment Options

### Option 1: Local Multi-Machine
1. Copy each batch file to a separate machine
2. On each machine, run:
   \`\`\`powershell
   cd backend
   npx tsx scripts/generate-batch.ts ../data/distributed-batches/batch-N.json
   \`\`\`

### Option 2: Cloud Instances (AWS/Azure/GCP)
1. Spin up ${batchCount} cloud instances
2. Install Node.js and dependencies on each
3. Copy batch file and generation scripts
4. Run generation on each instance
5. Collect results from all instances

### Option 3: Docker Containers
1. Build Docker image with generation system
2. Run ${batchCount} containers, each with a batch file
3. Mount output directory for results
4. Monitor container logs for progress

## Performance Estimates

**Per Machine (5 workers)**:
- Time: ~${Math.ceil((batchSize / 5) * 2.5 / 60)} hours per batch
- Cost: ~$${(batchSize * 0.75).toFixed(2)} per batch

**Total (${batchCount} machines)**:
- Time: ~${Math.ceil((batchSize / 5) * 2.5 / 60)} hours (parallel)
- Cost: ~$${(batchCount * batchSize * 0.75).toFixed(2)} total
- Output: ${batchCount * batchSize} courses

## Monitoring

Each machine will generate:
- \`parallel-generation-log.json\` - Success/failure log
- \`error-[COURSE_CODE].log\` - Error details
- \`courses/COURSE_*\` - Generated course directories

## Collecting Results

After all batches complete:
1. Copy all \`courses/COURSE_*\` directories to central location
2. Merge all \`parallel-generation-log.json\` files
3. Review error logs and re-run failed courses
4. Validate quality across all courses

## Scaling to 10,000+ Courses

With distributed generation:
- 100 machines × 5 workers = 500 parallel courses
- 10,000 courses ÷ 500 = 20 hours
- **Timeline**: Less than 1 day for 10,000 courses!

## Cost Optimization

- Use spot instances for 60-70% cost savings
- Batch during off-peak hours
- Use reserved instances for predictable workloads
- Monitor and optimize worker count per machine
`;

    const instructionsPath = path.join(this.outputDir, 'INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, instructions);

    console.log(`\n📄 Instructions saved: ${instructionsPath}`);
  }
}

// Main execution
function main(): void {
  const args = process.argv.slice(2);
  const batchSize = args[0] ? parseInt(args[0]) : 50;

  if (isNaN(batchSize) || batchSize < 1) {
    console.error('❌ Invalid batch size. Use positive number.');
    process.exit(1);
  }

  const generator = new DistributedCourseGenerator();
  generator.splitCatalog(batchSize);
}

main();
