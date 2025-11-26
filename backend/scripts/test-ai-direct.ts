/**
 * Direct AI API Test Script
 * Tests OpenAI API connectivity and response time
 */

import OpenAI from 'openai';

async function testOpenAIAPI() {
    console.log('🔍 Testing OpenAI API Direct Connection...\n');
    
    // Hardcoded for testing (will be removed after test)
    const apiKey = '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';
    const timeout = 180000;
    
    console.log('Configuration:');
    console.log(`- API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'NOT SET'}`);
    console.log(`- Timeout: ${timeout}ms (${timeout / 1000}s)`);
    console.log('');
    
    if (!apiKey) {
        console.error('❌ ERROR: OPENAI_API_KEY not set in .env file');
        process.exit(1);
    }
    
    const openai = new OpenAI({
        apiKey,
        timeout,
        maxRetries: 3
    });
    
    console.log('📡 Making test API call...');
    const startTime = Date.now();
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant for ScrollUniversity.'
                },
                {
                    role: 'user',
                    content: 'Write a brief 2-sentence introduction to a university course on biblical studies.'
                }
            ],
            max_tokens: 100,
            temperature: 0.7
        });
        
        const duration = Date.now() - startTime;
        
        console.log('\n✅ SUCCESS!');
        console.log(`⏱️  Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
        console.log(`📊 Tokens Used: ${response.usage?.total_tokens || 'unknown'}`);
        console.log(`💬 Response:\n${response.choices[0]?.message?.content || 'No content'}`);
        console.log('');
        
        // Test with longer content (similar to course generation)
        console.log('📡 Testing with longer content generation...');
        const startTime2 = Date.now();
        
        const response2 = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert course content creator for ScrollUniversity, a Christian educational platform.'
                },
                {
                    role: 'user',
                    content: `Generate a comprehensive lecture outline for a university course on "Introduction to Biblical Studies". Include:
1. Main topics (3-5 topics)
2. Key learning objectives (3-5 objectives)
3. Biblical references
4. Practical applications

Keep it detailed but concise.`
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });
        
        const duration2 = Date.now() - startTime2;
        
        console.log('\n✅ LONGER CONTENT SUCCESS!');
        console.log(`⏱️  Duration: ${duration2}ms (${(duration2 / 1000).toFixed(2)}s)`);
        console.log(`📊 Tokens Used: ${response2.usage?.total_tokens || 'unknown'}`);
        console.log(`💬 Response Length: ${response2.choices[0]?.message?.content?.length || 0} characters`);
        console.log('');
        
        console.log('✅ All tests passed! OpenAI API is working correctly.');
        console.log('');
        console.log('📋 Summary:');
        console.log(`- Short test: ${duration}ms`);
        console.log(`- Long test: ${duration2}ms`);
        console.log(`- API Key: Valid and working`);
        console.log(`- Timeout: ${timeout}ms is sufficient`);
        
    } catch (error: any) {
        const duration = Date.now() - startTime;
        
        console.error('\n❌ ERROR!');
        console.error(`⏱️  Failed after: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
        console.error(`🔴 Error Type: ${error.constructor.name}`);
        console.error(`💬 Error Message: ${error.message}`);
        
        if (error.code) {
            console.error(`📋 Error Code: ${error.code}`);
        }
        
        if (error.status) {
            console.error(`📊 HTTP Status: ${error.status}`);
        }
        
        console.error('');
        console.error('Stack Trace:');
        console.error(error.stack);
        
        process.exit(1);
    }
}

// Run the test
testOpenAIAPI().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
