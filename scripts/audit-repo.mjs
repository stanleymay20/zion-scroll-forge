#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIRS = ['src', 'supabase/functions'];
const IGNORE_PARTS = [
  'node_modules',
  'dist',
  'coverage',
  'backend/coverage',
  'comprehensive-src',
  'src-comprehensive',
  '.git',
];

const checks = [
  {
    key: 'legacy-api-call',
    severity: 'error',
    description: 'Frontend/runtime code must not call non-existent /api routes unless a real backend is deployed.',
    pattern: /(['"`])\/api\//,
  },
  {
    key: 'unsupported-avatar-claim',
    severity: 'error',
    description: 'Do not claim live avatar/voice/classroom AI tutors unless WebRTC/avatar/TTS/STT production services are wired and feature-gated.',
    pattern: /\b(live\s+avatar|avatar\s+classroom|voice\s+tutor|speaking\s+avatar|lip[-\s]?sync|web\s?rtc|real[-\s]?time\s+avatar)\b/i,
  },
  {
    key: 'unsupported-superiority-claim',
    severity: 'error',
    description: 'Do not make unverifiable AI superiority/accuracy claims in production UI.',
    pattern: /\b(quantum\s+consciousness|superior\s+to\s+gpt|\d+%\+?\s+accuracy|prophetic\s+accuracy|200%\+?\s+superior)\b/i,
  },
  {
    key: 'blocking-alert',
    severity: 'warning',
    description: 'Use toast or inline UI instead of blocking alert().',
    pattern: /\balert\s*\(/,
  },
  {
    key: 'dead-hash-link',
    severity: 'warning',
    description: 'Replace href="#" with a real route, button, or disabled state.',
    pattern: /href=\{?['"]#['"]\}?/,
  },
  {
    key: 'noop-click-handler',
    severity: 'warning',
    description: 'No-op click handlers make buttons look functional when they are not.',
    pattern: /onClick=\{\s*(?:\(\)\s*=>\s*)?\{\s*\}\s*\}/,
  },
  {
    key: 'raw-error-toast',
    severity: 'warning',
    description: 'Do not leak raw error.message to users; use the central friendly error parser.',
    pattern: /toast\.(?:error|warning)\([^\n)]*(?:error|err|e)\.message/,
  },
  {
    key: 'console-log-production-surface',
    severity: 'info',
    description: 'Review console statements in user-facing code; production build may drop them, but critical errors need structured logging.',
    pattern: /console\.(?:log|warn|error)\s*\(/,
  },
];

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const stack = [abs];
  while (stack.length) {
    const current = stack.pop();
    const relCurrent = path.relative(ROOT, current).replaceAll('\\\\', '/');
    if (IGNORE_PARTS.some((part) => relCurrent.includes(part))) continue;
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const child of fs.readdirSync(current)) stack.push(path.join(current, child));
    } else if (/\.(ts|tsx|js|jsx)$/.test(current)) {
      out.push(current);
    }
  }
  return out;
}

const findings = [];
for (const dir of SRC_DIRS) {
  for (const file of walk(dir)) {
    const rel = path.relative(ROOT, file).replaceAll('\\\\', '/');
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, idx) => {
      for (const check of checks) {
        if (check.pattern.test(line)) {
          findings.push({
            check: check.key,
            severity: check.severity,
            file: rel,
            line: idx + 1,
            description: check.description,
            excerpt: line.trim().slice(0, 220),
          });
        }
      }
    });
  }
}

const bySeverity = findings.reduce((acc, item) => {
  acc[item.severity] = (acc[item.severity] || 0) + 1;
  return acc;
}, {});

console.log('ScrollUniversity repository audit');
console.log('=================================');
console.log(`Files scanned from: ${SRC_DIRS.join(', ')}`);
console.log(`Findings: ${findings.length}`);
console.log(`Severity counts: ${JSON.stringify(bySeverity)}`);
console.log('');

for (const item of findings) {
  console.log(`[${item.severity.toUpperCase()}] ${item.check} ${item.file}:${item.line}`);
  console.log(`  ${item.description}`);
  console.log(`  ${item.excerpt}`);
}

const errorCount = findings.filter((f) => f.severity === 'error').length;
if (errorCount > 0) {
  console.error(`\nAudit failed: ${errorCount} error-level finding(s).`);
  process.exit(1);
}

console.log('\nAudit passed: no error-level findings. Review warnings/info before launch.');
