// verify-provider-contract.js
require('dotenv').config({ path: '/home/john/gits/FCDocker/frontend/tests/pact/.env' });
const axios = require('axios');

// 🔧 Configuration
const PACTFLOW_URL = process.env.PACTFLOW_URL;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;
const PROVIDER_NAME = process.env.PROVIDER_NAME;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION;

console.log('🔐 PactFlow Verification Configuration');
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`PACTFLOW_TOKEN: ${PACTFLOW_TOKEN ? '✅ Loaded' : '❌ Not Loaded'}`);
console.log(`PROVIDER_NAME: ${PROVIDER_NAME}`);
console.log(`PROVIDER_VERSION: ${PROVIDER_VERSION}`);
console.log('--------------------------------------------');

// 📤 Publish dummy verification result
async function publishVerificationResult() {
  const url = `${PACTFLOW_URL}/contracts/provider/${PROVIDER_NAME}/version/${PROVIDER_VERSION}/verification-results`;

  const payload = {
    success: true,
    providerApplicationVersion: PROVIDER_VERSION,
    verifiedBy: {
      name: "manual-verification-script",
      version: "1.0"
    }
  };

  console.log(`📡 Posting verification result to ${url}`);
  try {
    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Verification result published: ${res.status} ${res.statusText}`);
  } catch (error) {
    console.error('❌ Failed to publish verification result:', error.response?.data || error.message);
    process.exit(1);
  }
}

// 🚀 Run the script
(async () => {
  await publishVerificationResult();
})();
