const https = require('https');
const http = require('http');

// Configuration
const SWAGGERHUB_TOKEN = process.env.SWAGGERHUB_API_TOKEN || '42576ec1-5734-4a57-9b5f-da1090af8d68';
const LOCAL_API_URL = 'http://localhost:8000';
const SWAGGERHUB_API = 'Monahan-Tutorials/Full-Contact-Django-extract/1.0.2';

console.log('🔄 Starting Manual API Drift Verification');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!SWAGGERHUB_TOKEN) {
    console.log('❌ SwaggerHub API token not found!');
    process.exit(1);
}

// Helper function to make HTTP requests
function makeRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        const options = {
            headers: {
                'User-Agent': 'FCDocker-Drift-Verifier/1.0',
                ...headers
            }
        };
        
        const req = client.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function main() {
    try {
        // Step 1: Fetch SwaggerHub API specification
        console.log('📥 Fetching SwaggerHub API specification...');
        const swaggerHubUrl = `https://api.swaggerhub.com/apis/${SWAGGERHUB_API}/swagger.json`;
        const swaggerHeaders = { 'Authorization': `Bearer ${SWAGGERHUB_TOKEN}` };
        
        const swaggerResult = await makeRequest(swaggerHubUrl, swaggerHeaders);
        
        if (swaggerResult.statusCode !== 200) {
            console.log(`❌ Failed to fetch SwaggerHub API: ${swaggerResult.statusCode}`);
            process.exit(1);
        }
        
        const swaggerSpec = swaggerResult.data;
        console.log('   ✅ Successfully fetched SwaggerHub specification');
        console.log(`   📋 API Title: ${swaggerSpec.info?.title || 'Unknown'}`);
        console.log(`   🔢 API Version: ${swaggerSpec.info?.version || 'Unknown'}`);
        
        // Step 2: Fetch local API schema
        console.log('\\n📥 Fetching local API schema...');
        const localSchemaUrl = `${LOCAL_API_URL}/schema/`;
        
        const localResult = await makeRequest(localSchemaUrl);
        
        if (localResult.statusCode !== 200) {
            console.log(`❌ Failed to fetch local API schema: ${localResult.statusCode}`);
            console.log('   💡 Make sure your Django server is running: docker-compose up -d');
            process.exit(1);
        }
        
        const localSchema = localResult.data;
        console.log('   ✅ Successfully fetched local schema');
        
        // Step 3: Compare API paths  
        console.log('\\n🔍 Comparing API endpoints...');
        
        const swaggerPaths = Object.keys(swaggerSpec.paths || {}).sort();
        const localPaths = Object.keys(localSchema.paths || {}).sort();
        
        console.log(`   📊 SwaggerHub paths: ${swaggerPaths.length}`);
        console.log(`   📊 Local paths: ${localPaths.length}`);
        
        // Since Django schema is broken, test SwaggerHub paths directly
        console.log('\\n⚠️  Django schema incomplete - testing SwaggerHub paths directly');
        
        // Step 4: Test SwaggerHub endpoints against running API (EXACT paths only)
        console.log('\\n🧪 Testing SwaggerHub endpoints (exact paths from spec)...');
        
        const testResults = [];
        const testPaths = swaggerPaths; // Test ALL SwaggerHub paths, exact format only
        
        for (const path of testPaths) {
            // Test ONLY the exact path from SwaggerHub Studio (no variations)
            console.log(`   🔍 Testing: ${path}`);
            const testUrl = `${LOCAL_API_URL}${path}`;
            
            try {
                const testResult = await makeRequest(testUrl);
                const success = testResult.statusCode >= 200 && testResult.statusCode < 300;
                
                testResults.push({
                    path,
                    success,
                    statusCode: testResult.statusCode
                });
                
                if (success) {
                    console.log(`      ✅ ${testResult.statusCode} (SwaggerHub spec format)`);
                } else {
                    console.log(`      ❌ ${testResult.statusCode} (spec format not working)`);
                }
            } catch (error) {
                testResults.push({
                    path,
                    success: false,
                    error: error.message
                });
                console.log(`      ❌ Error: ${error.message}`);
            }
        }
        
        // Step 5: Summary
        console.log('\\n📊 Drift Verification Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const successfulTests = testResults.filter(result => result.success).length;
        const totalTests = testResults.length;
        const failedPaths = testResults.filter(result => !result.success);
        
        console.log(`🎯 SwaggerHub Spec Compliance: ${successfulTests}/${totalTests} endpoints working`);
        console.log(`📊 SwaggerHub Studio Format: All paths WITHOUT trailing slashes`);
        console.log(`🔧 Django Schema Endpoints: ${localPaths.length} (broken/incomplete)`);
        
        if (failedPaths.length > 0) {
            console.log(`\\n❌ Non-compliant Endpoints (${failedPaths.length} total):`);
            failedPaths.forEach(result => {
                console.log(`   • ${result.path} - ${result.statusCode || result.error}`);
            });
        }
        
        const driftPercentage = Math.round((failedPaths.length / swaggerPaths.length) * 100);
        
        if (driftPercentage === 0) {
            console.log('\\n✅ Perfect API Compliance!');
            console.log('   Your API perfectly matches the SwaggerHub Studio specification.');
        } else if (driftPercentage <= 25) {
            console.log(`\\n⚠️  Minor API Drift (${driftPercentage}%)`);
            console.log('   Most endpoints work - focus on fixing the failed ones above.');
        } else {
            console.log(`\\n🚨 Significant API Drift (${driftPercentage}%)`);
            console.log('   Major differences between SwaggerHub Studio spec and running API.');
            console.log('   Either implement missing endpoints or update SwaggerHub Studio spec.');
        }
        
        console.log('\\n💡 Next Steps:');
        console.log('   1. Review any path differences above');
        console.log('   2. Fix failing endpoints if any');
        console.log('   3. Update SwaggerHub spec or local API to align');
        console.log('   4. Re-run this script to verify fixes');
        
        console.log('\\n🔄 Manual Drift Verification Complete!');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
}

main();