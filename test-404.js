const http = require('http');

// 测试函数
async function testUrl(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      console.log(`URL: ${url}`);
      console.log(`Status Code: ${response.statusCode}`);
      console.log(`Status Message: ${response.statusMessage}`);
      console.log('---');
      resolve(response.statusCode);
    });

    request.on('error', (error) => {
      console.error(`Error testing ${url}:`, error.message);
      resolve(null);
    });

    // 设置超时
    request.setTimeout(10000, () => {
      console.log(`Timeout for ${url}`);
      request.destroy();
      resolve(null);
    });
  });
}

// 测试 URL 列表
const testUrls = [
  'http://localhost:3000/cdn-cgi/l/email-protection',
  'http://localhost:3000/blog/usingplanetaryhours',
  'http://localhost:3000/blog/algorithmbehindcalculator',
  'http://localhost:3000/blog/whatareplanetaryhours',
  'http://localhost:3000/nonexistent-page',
  'http://localhost:3000/', // 正常页面作为对比
  'http://localhost:3000/about', // 正常页面作为对比
];

async function runTests() {
  console.log('Testing 404 status codes...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
    // 添加小延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

runTests().catch(console.error); 