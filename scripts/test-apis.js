async function testAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  const tests = [
    {
      name: 'Text-to-Image API',
      url: `${baseUrl}/api/text-to-image`,
      method: 'POST',
      body: {
        prompt: 'a cute cat',
        width: '512',
        height: '512'
      }
    },
    {
      name: 'Text-to-Text API - Translation',
      url: `${baseUrl}/api/text-to-text`,
      method: 'POST',
      body: {
        text: 'Hello world',
        type: 'translate',
        targetLanguage: 'zh'
      }
    },
    {
      name: 'Text-to-Speech API',
      url: `${baseUrl}/api/text-to-speech`,
      method: 'POST',
      body: {
        text: 'Hello world',
        voice: 'zh-CN-XiaoxiaoNeural',
        speed: 1.0
      }
    },
    {
      name: 'Speech-to-Text API',
      url: `${baseUrl}/api/speech-to-text`,
      method: 'POST',
      body: {
        audioData: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        format: 'wav',
        language: 'auto'
      }
    }
  ];

  console.log('Starting API tests...\n');

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: test.body ? { 'Content-Type': 'application/json' } : {}
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(test.url, options);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name} - Success`);
        console.log(`   Status: ${response.status}`);
        if (data.success) console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}...`);
      } else {
        console.log(`❌ ${test.name} - Failed`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error`);
      console.log(`   Error message: ${error.message}`);
    }
    console.log('');
  }
}

// Execute tests only when run directly
if (require.main === module) {
  testAPIs().catch(console.error);
}

module.exports = testAPIs;