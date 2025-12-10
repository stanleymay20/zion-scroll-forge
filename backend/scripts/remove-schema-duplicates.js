/**
 * Remove duplicate models and enums from Prisma schema
 * Keeps first occurrence, removes second occurrence
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

console.log('Reading schema...');
const content = fs.readFileSync(schemaPath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);

// Find duplicate section boundaries
// The duplicate section starts around line 2450 and we need to remove it
// We'll find it by looking for the second occurrence of "ScrollGold Blockchain Integration"

let firstScrollGoldLine = -1;
let secondScrollGoldLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ScrollGold Blockchain Integration')) {
    if (firstScrollGoldLine === -1) {
      firstScrollGoldLine = i;
    } else {
      secondScrollGoldLine = i;
      break;
    }
  }
}

console.log(`First ScrollGold section: line ${firstScrollGoldLine + 1}`);
console.log(`Second ScrollGold section (duplicate): line ${secondScrollGoldLine + 1}`);

// Find where the duplicate section ends (before any new unique content)
// The duplicate section should end before line 2883
let duplicateSectionEnd = lines.length;

// Remove from second ScrollGold occurrence to end of file
// (since the duplicates go all the way to the end)
const cleanedLines = lines.slice(0, secondScrollGoldLine);

console.log(`Removing lines ${secondScrollGoldLine + 1} to ${lines.length}`);
console.log(`New total lines: ${cleanedLines.length}`);

const cleanedContent = cleanedLines.join('\n');
fs.writeFileSync(schemaPath, cleanedContent, 'utf8');

console.log('✅ Duplicates removed!');
console.log('\nNext: npx prisma db pull --force');
