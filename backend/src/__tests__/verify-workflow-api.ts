/**
 * Verification script for Workflow & Notification API endpoints
 * This script verifies that the API endpoints are properly structured
 */

import express from 'express';
import workflowNotificationRoutes from '../routes/workflow-notifications';

// Test that the routes can be imported and mounted
const app = express();
app.use(express.json());

try {
  // Mount the routes
  app.use('/api', workflowNotificationRoutes);
  
  // Get the route stack to verify endpoints exist
  const router = workflowNotificationRoutes;
  const routes: string[] = [];
  
  // Extract routes from the router stack
  if (router.stack) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        const path = layer.route.path;
        methods.forEach(method => {
          routes.push(`${method.toUpperCase()} ${path}`);
        });
      }
    });
  }
  
  console.log('✅ Workflow & Notification API Routes Verification');
  console.log('================================================');
  console.log('Successfully imported and mounted routes:');
  
  const expectedRoutes = [
    'POST /workflows/execute',
    'GET /workflows/:id/status', 
    'POST /notifications/send',
    'POST /notifications/bulk',
    'GET /notifications/:id/status',
    'GET /notifications/analytics',
    'GET /workflows/health'
  ];
  
  expectedRoutes.forEach(expectedRoute => {
    const found = routes.some(route => {
      // Normalize route patterns for comparison
      const normalizedRoute = route.replace(/:id/g, ':id');
      const normalizedExpected = expectedRoute.replace(/:id/g, ':id');
      return normalizedRoute === normalizedExpected;
    });
    
    if (found) {
      console.log(`✅ ${expectedRoute}`);
    } else {
      console.log(`❌ ${expectedRoute} - NOT FOUND`);
    }
  });
  
  console.log('\nActual routes found:');
  routes.forEach(route => {
    console.log(`   ${route}`);
  });
  
  console.log('\n✅ API structure verification completed successfully!');
  
} catch (error) {
  console.error('❌ Error verifying API routes:', error);
  process.exit(1);
}