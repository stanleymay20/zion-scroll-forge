/**
 * Academic Calendar API Verification Script
 * "By wisdom a house is built, and through understanding it is established" - Proverbs 24:3
 * 
 * Verifies that all required endpoints are implemented and accessible
 * Maintains strict TypeScript compliance with zero hardcoding
 */

import express, { Router } from 'express';
import academicCalendarRoutes from '../routes/academic-calendar';

// Type definitions for route extraction
interface RouteInfo {
  path: string;
  methods: string[];
}

interface ExpressLayer {
  route?: {
    path: string;
    methods: Record<string, boolean>;
  };
  name?: string;
  handle?: {
    stack: ExpressLayer[];
  };
  regexp?: {
    source: string;
  };
}

interface ExpressRouter {
  stack: ExpressLayer[];
}

interface RequiredEndpoint {
  path: string;
  method: string;
  description: string;
}

console.log('🔍 Verifying Academic Calendar API Implementation...\n');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/academic-calendar', academicCalendarRoutes);

// Get all routes from the router
const routes: RouteInfo[] = [];

/**
 * Recursively extract routes from Express middleware stack
 * @param stack - Express middleware stack
 * @param basePath - Base path for routes
 */
function extractRoutes(stack: ExpressLayer[], basePath: string = ''): void {
  stack.forEach((middleware) => {
    if (middleware.route) {
      // Route middleware - extract HTTP methods and path
      const methods = Object.keys(middleware.route.methods);
      routes.push({
        path: basePath + middleware.route.path,
        methods: methods.map(m => m.toUpperCase())
      });
    } else if (middleware.name === 'router' && middleware.handle) {
      // Router middleware - extract nested routes
      let routerPath = '';
      if (middleware.regexp && middleware.regexp.source) {
        const match = middleware.regexp.source.match(/^\\\/([^\\]+)/);
        if (match && match[1]) {
          routerPath = match[1];
        }
      }
      extractRoutes(middleware.handle.stack, basePath + routerPath);
    }
  });
}

// Extract routes from the academic calendar router
// Use type assertion for internal Express API access (necessary for route inspection)
const router = (app as unknown as { _router: ExpressRouter })._router;
extractRoutes(router.stack, '/api/academic-calendar');

// Required endpoints from Task 8 specification
const requiredEndpoints: RequiredEndpoint[] = [
  { 
    path: '/api/academic-calendar/years', 
    method: 'POST', 
    description: 'Create academic year' 
  },
  { 
    path: '/api/academic-calendar/years/:id', 
    method: 'GET', 
    description: 'Get academic year details' 
  },
  { 
    path: '/api/academic-calendar/semesters', 
    method: 'POST', 
    description: 'Generate semester schedule' 
  },
  { 
    path: '/api/academic-calendar/deadlines', 
    method: 'GET', 
    description: 'Get upcoming deadlines' 
  },
  { 
    path: '/api/academic-calendar/events', 
    method: 'POST', 
    description: 'Schedule academic event' 
  },
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

// Show all routes not in required list
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
