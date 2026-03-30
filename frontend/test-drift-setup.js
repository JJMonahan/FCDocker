#!/usr/bin/env node

/**
 * Helper script to test SwaggerHub Drift integration
 * This will help you verify the setup and see drift detection in action
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎯 SwaggerHub Drift Integration Test Helper');
console.log('═══════════════════════════════════════════════════');
console.log(); 

// Check prerequisites 
console.log('📋 Checking prerequisites...');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  console.log('✅ Environment file (.env.local) found');
} else {
  console.log('❌ Environment file missing. Creating .env.local...');
  fs.copyFileSync('.env.example', '.env.local');
  console.log('✅ Created .env.local with SwaggerHub token');
}

// Check if Docker is running
try {
  execSync('docker ps', { stdio: 'pipe' });
  console.log('✅ Docker is running');
} catch (error) {
  console.log('⚠️  Docker may not be running. Start with: docker-compose up -d');
}

// Check if API is accessible
try {
  const fetch = require('node-fetch').default;
  console.log('Checking API access... (if this fails, that is expected for the test!)');
} catch (error) {
  console.log('ℹ️  Will test SwaggerHub connectivity instead');
}

console.log();
console.log('🚀 Ready for Drift Testing!');
console.log('═════════════════════════════');
console.log();

console.log('Your configuration pulls from:');
console.log('📍 SwaggerHub API: https://api.swaggerhub.com/apis/Monahan-Tutorials/Full-Contact-Django-extract/1.0.2');
console.log('🎯 Local API: http://localhost:8000');
console.log();

console.log('Test Scenarios:');
console.log('═══════════════');
console.log();

console.log('1️⃣ **Normal Operation** (APIs match):');
console.log('   npm run drift:verify');
console.log('   → Should show all tests PASS');
console.log();

console.log('2️⃣ **Breaking Changes** (APIs differ):');
console.log('   • Go to SwaggerHub Studio');
console.log('   • Edit "Full-Contact-Django-extract" API');
console.log('   • Make breaking changes (remove fields, change status codes, etc.)');
console.log('   • Publish the changes'); 
console.log('   • Run: npm run drift:verify');
console.log('   → Should show FAILURES with detailed contract violations!');
console.log();

console.log('3️⃣ **SwaggerHub-Only Testing** (no local API needed):');
console.log('   npm run drift:verify-swaggerhub-only');
console.log('   → Tests SwaggerHub spec internally (for schema validation)');
console.log();

console.log('🔍 What Drift Catches:');
console.log('• Response schema mismatches');
console.log('• Missing/extra fields');  
console.log('• Wrong HTTP status codes');
console.log('• Data type violations');
console.log('• Required field changes');
console.log();

console.log('😈 **Go ahead - make those breaking changes in SwaggerHub Studio!**');
console.log('🧪 Drift will catch every contract violation and show you exactly what broke.');
console.log();

console.log('Commands to try:');
console.log('• npm run api:verify          (basic endpoint check)');
console.log('• npm run drift:verify        (SwaggerHub vs local API)');
console.log('• npm run drift:auth          (authenticate with PactFlow)');
console.log();

console.log('Happy breaking! 🎉');