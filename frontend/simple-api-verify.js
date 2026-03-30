/**
 * Simple API Verification Script 
 * Tests Full Contact API endpoints against expected behavior
 * Use this while setting up PactFlow Drift authentication
 */

const assert = require('assert');

class SimpleAPIVerifier {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    this.results = [];
  }

  async verifyEndpoint(name, path, expectedStatus = 200, method = 'GET') {
    try {
      console.log(`Testing ${method} ${path}...`);
      
      const response = await fetch(`${this.baseUrl}${path}`, { method });
      const success = response.status === expectedStatus;
      
      this.results.push({
        name,
        path, 
        method,
        expectedStatus,
        actualStatus: response.status,
        success,
        contentType: response.headers.get('content-type')
      });

      console.log(`  ${success ? '✅' : '❌'} ${response.status} (expected ${expectedStatus})`);
      
      return success;
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      this.results.push({
        name,  
        path,
        method,
        expectedStatus,
        actualStatus: 'ERROR',
        success: false,
        error: error.message
      });
      return false;
    }
  }

  async runBasicVerification() {
    console.log('🔍 Running basic API verification...');
    console.log(`Base URL: ${this.baseUrl}`);
    console.log();

    // Test core endpoints
    await this.verifyEndpoint('Schema', '/schema/', 200);
    await this.verifyEndpoint('Companies List', '/api/companies/', 200);
    await this.verifyEndpoint('Contacts List', '/api/contacts/', 200); 
    await this.verifyEndpoint('Notes List', '/api/notes/', 200);
    await this.verifyEndpoint('Roles List', '/api/roles/', 200);
    await this.verifyEndpoint('Jobs List', '/api/jobs/', 200);
    await this.verifyEndpoint('Logs List', '/api/logs/', 200);
    
    // Test status endpoints (correct URLs)
    await this.verifyEndpoint('Mobile Status', '/api/mobile', 200);
    await this.verifyEndpoint('Desktop Status', '/api/desktop', 200);
    await this.verifyEndpoint('Website Status', '/api/website', 200);
    await this.verifyEndpoint('Tablet Status', '/api/tablet', 200);

    // Test 404 handling
    await this.verifyEndpoint('Not Found', '/api/nonexistent/', 404);

    this.printSummary();
  }

  printSummary() {
    console.log();
    console.log('📊 Verification Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`Total tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success rate: ${Math.round((passed / total) * 100)}%`);
    
    console.log();
    console.log('Detailed Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name}: ${result.actualStatus} ${result.path}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    console.log();
    if (passed === total) {
      console.log('🎉 All basic verifications passed! Your API is ready for PactFlow Drift testing.');
      console.log('Next steps:');
      console.log('  1. Run: npm run drift:auth');
      console.log('  2. Run: npm run drift:verify');
    } else {
      console.log('⚠️  Some verifications failed. Fix API issues before running Drift.');
      console.log('Ensure Docker services are running: docker-compose up -d');
    }
  }
}

// CLI usage
async function main() {
  const verifier = new SimpleAPIVerifier();
  
  try {
    await verifier.runBasicVerification();
  } catch (error) {
    console.error('❌ Verification failed:', error.message); 
    console.log('Make sure Docker services are running: docker-compose up -d');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SimpleAPIVerifier;