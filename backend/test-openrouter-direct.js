/**
 * Direct OpenRouter Test (No TypeScript compilation)
 */
const axios = require('axios');
require('dotenv').config();

async function testOpenRouter() {
    console.log('🔍 Testing OpenRouter API...\n');
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    
    console.log(`📡 API Key: ${apiKey?.substring(0, 20)}...`);
    console.log(`🌐 Base URL: ${baseURL}`);
    console.log('');
    
    try {
        console.log('📡 Making test API call...');
        
        const response = await axios.post(
            `${baseURL}/chat/completions`,
            {
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant.'
                    },
                    {
                        role: 'user',
                        content: 'Say "Hello from ScrollUniversity!" in one sentence.'
                    }
                ],
                max_tokens: 100,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://scrolluniversity.edu',
                    'X-Title': 'ScrollUniversity Course Generator'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ API call successful!');
        console.log('');
        console.log('📊 Response:');
        console.log(`  Model: ${response.data.model}`);
        console.log(`  Tokens: ${response.data.usage?.total_tokens || 0}`);
        console.log('');
        console.log('💬 Generated content:');
        console.log(`  ${response.data.choices[0]?.message?.content}`);
        console.log('');
        console.log('🎉 OpenRouter is working perfectly!');
        console.log('💰 Using FREE API - Ready for course generation!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

testOpenRouter();
