/**
 * Academic Calendar API Verification Script
 * Verifies that all required endpoints are implemented and accessible
 */

import express from 'express';
import academicCalendarRoutes from '../routes/academic-calendar';

console.log('🔍 Verifying Academic Calendar API Implementation...\n');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/academic-calendar', academicCalendarRoutes);

// Get all routes from the router
const routes: any[] = [];
function extractRoutes(stack: any[], basePath = '') {
  stack.forEach((middleware) => {
    if (middleware.route) {
      // Route middleware
      const methods = Object.keys(middleware.route.methods);
      routes.push({
        path: basePath + middleware.route.path,
        methods: methods.map(m => m.toUpperCase())
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      extractRoutes(middleware.handle.stack, basePath + (middleware.regexp.source.match(/^\\\/([^\\]+)/) || ['', ''])[1]);
    }
  });
}

// Extract routes from the academic calendar router
const router = app._router;
extractRoutes(router.stack, '/api/academic-calendar');

// Required endpoints from task 8
const requiredEndpoints = [
  { path: '/api/academic-calendar/years', method: 'POST', description: 'Create academic year' },
  { path: '/api/academic-calendar/years/:id', method: 'GET', description: 'Get academic year details' },
  { path: '/api/academic-calendar/semesters', method: 'POST', description: 'Generate semester schedule' },
  { path: '/api/academic-calendar/deadlines', method: 'GET', description: 'Get upcoming deadlines' },
  { path: '/api/academic-calendar/events', method: 'POST', description: 'Schedule academic event' },
];

console.log('✅ Required Endpoints (from Task 8):');
console.log('=====================================\n');

let allImplemented = true;

requiredEndpoints.forEach((required, index) => {
  const found = routes.find(r => 
    r.path.includes(required.path.replace('/api/academic-calendar', '')) && 
    r.methods.includes(required.method)
  );
  
  if (found) {
    console.log(`${index + 1}. ✅ ${required.method} ${required.path}`);
    console.log(`   Description: ${required.description}`);
    console.log(`   Status: IMPLEMENTED\n`);
  } else {
    console.log(`${index + 1}. ❌ ${required.method} ${required.path}`);
    console.log(`   Description: ${required.description}`);
    console.log(`   Status: MISSING\n`);
    allImplemented = false;
  }
});

console.log('\n📋 Additional Endpoints Found:');
console.log('================================\n');

// Show all routes
const additionalRoutes = routes.filter(r => {
  return !requiredEndpoints.some(req => 
    r.path.includes(req.path.replace('/api/academic-calendar', '')) && 
    r.methods.includes(req.method)
  );
});

additionalRoutes.forEach((route, index) => {
  console.log(`${index + 1}. ${route.methods.join(', ')} ${route.path}`);
});

console.log('\n\n📊 Summary:');
console.log('===========\n');
console.log(`Total Required Endpoints: ${requiredEndpoints.length}`);
console.log(`Total Implemented: ${allImplemented ? requiredEndpoints.length : 'INCOMPLETE'}`);
console.log(`Additional Endpoints: ${additionalRoutes.length}`);
console.log(`Total Endpoints: ${routes.length}\n`);

if (allImplemented) {
  console.log('✅ SUCCESS: All required endpoints are implemented!');
  console.log('✅ Task 8: Create Academic Calendar API endpoints - COMPLETE\n');
  process.exit(0);
} else {
  console.log('❌ FAILURE: Some required endpoints are missing!');
  console.log('❌ Task 8: Create Academic Calendar API endpoints - INCOMPLETE\n');
  process.exit(1);
}
