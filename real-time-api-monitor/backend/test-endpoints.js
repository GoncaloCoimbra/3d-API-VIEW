const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const sampleEndpoints = [
  {
    name: 'Google',
    url: 'https://www.google.com',
    method: 'GET',
    healthCheckInterval: 30000,
    expectedStatusCode: 200
  },
  {
    name: 'GitHub API',
    url: 'https://api.github.com',
    method: 'GET',
    healthCheckInterval: 60000,
    expectedStatusCode: 200
  },
  {
    name: 'JSONPlaceholder',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    healthCheckInterval: 45000,
    expectedStatusCode: 200
  },
  {
    name: 'HTTPBin Status',
    url: 'https://httpbin.org/status/200',
    method: 'GET',
    healthCheckInterval: 30000,
    expectedStatusCode: 200
  },
  {
    name: 'HTTPBin Delay (Slow)',
    url: 'https://httpbin.org/delay/2',
    method: 'GET',
    healthCheckInterval: 60000,
    expectedStatusCode: 200,
    timeout: 5000
  }
];

async function addEndpoint(endpoint) {
  try {
    const response = await axios.post(\\/api/endpoints\, endpoint);
    console.log(\✅ Added: \\);
    return response.data;
  } catch (error) {
    console.error(\❌ Failed to add \:\, error.message);
  }
}

async function getStats() {
  try {
    const response = await axios.get(\\/api/metrics/dashboard/stats\);
    console.log('\\n📊 Dashboard Stats:');
    console.log(JSON.stringify(response.data.data, null, 2));
  } catch (error) {
    console.error('❌ Failed to get stats:', error.message);
  }
}

async function listEndpoints() {
  try {
    const response = await axios.get(\\/api/endpoints\);
    console.log(\\\n📋 Total Endpoints: \\);
    response.data.data.forEach(ep => {
      console.log(\  - \ (\)\);
    });
  } catch (error) {
    console.error('❌ Failed to list endpoints:', error.message);
  }
}

async function main() {
  console.log('🚀 Testing API Health Monitor Backend\\n');

  try {
    await axios.get(\\/health\);
    console.log('✅ Server is running\\n');
  } catch (error) {
    console.error('❌ Server is not running. Start it with: npm run dev');
    process.exit(1);
  }

  console.log('📝 Adding sample endpoints...\\n');
  for (const endpoint of sampleEndpoints) {
    await addEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\\n⏳ Waiting for initial health checks...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  await listEndpoints();
  await getStats();

  console.log('\\n✅ Test completed! Open http://localhost:5000/health to see server status');
}

main().catch(console.error);
