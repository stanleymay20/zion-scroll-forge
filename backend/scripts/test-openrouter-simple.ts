/**
 * Simple OpenRouter Connection Test
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testOpenRouter() {
    console.log('🔍 Testing OpenRouter Integration...\n');
    
    try {
        // Dynamically import the service
        const { openRouterService } = await import('../src/services/OpenRouterService');
        
        console.log('✅ OpenRouter service loaded successfully');
        console.log(`📡 API Key configured: ${process.env.OPENROUTER_API_KEY?.substring(0, 20)}...`);
        console.log(`🌐 Base URL: ${process.env.OPENROUTER_BASE_URL}`);
        console.log('');
        
        // Test 1: Basic Connection
        console.log('📡 Test 1: Basic Connection Test');
        const connectionTest = await openRouterService.testConnection();
        
        if (connectionTest) {
            console.log('✅ Connection successful!');
        } else {
            console.log('❌ Connection failed!');
            return;
        }
        console.log('');
        
        // Test 2: Simple Content Generation
        console.log('🎯 Test 2: Simple Content Generation');
        const simpleContent = await openRouterService.generateContent([
            {
                role: 'system',
                content: 'You are a helpful assistant for ScrollUniversity.'
            },
            {
                role: 'user',
                content: 'Write a brief 2-sentence introduction to biblical studies.'
            }
        ], 'openai/gpt-4o-mini');
        
        console.log('✅ Simple generation successful!');
        console.log(`📝 Generated: ${simpleContent.substring(0, 150)}...`);
        console.log('');
        
        // Test 3: Lecture Content Generation
        console.log('📚 Test 3: Lecture Content Generation');
        const lectureContent = await openRouterService.generateLectureContent(
            'Introduction to Biblical Studies',
            'Module 1: Foundations',
            'Understanding Scripture',
            'BEGINNER',
            'University Students'
        );
        
        console.log('✅ Lecture generation successful!');
        console.log(`📖 Generated ${lectureContent.length} characters of content`);
        console.log(`📝 Preview: ${lectureContent.substring(0, 200)}...`);
        console.log('');
        
        // Summary
        console.log('🎉 ALL TESTS PASSED!');
        console.log('');
        console.log('📋 Summary:');
        console.log('✅ OpenRouter connection working');
        console.log('✅ Content generation working');
        console.log('✅ Lecture generation working');
        console.log('');
        console.log('🚀 Ready to generate courses with OpenRouter!');
        console.log('💰 Using FREE API - No billing issues!');
        
    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('1. Check OPENROUTER_API_KEY in .env file');
        console.error('2. Verify internet connection');
        console.error('3. Check OpenRouter API status');
        console.error('');
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Run the test
testOpenRouter().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
