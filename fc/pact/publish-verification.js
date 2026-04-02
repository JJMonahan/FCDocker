const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PACTFLOW_URL = process.env.PACTFLOW_URL;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;
const PROVIDER_NAME = process.env.PROVIDER_NAME;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION || '0.1.0';

const payload = {
  success: true,
  providerApplicationVersion: PROVIDER_VERSION,
  verifiedBy: {
    name: "manual-verification-script",
    version: "1.0"
  },
  // Optional: Add build URL if you have one
  buildUrl: "https://ci.example.com/builds/123"
};

console.log(`🔐 Environment & Provider Info`);
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`PACTFLOW_TOKEN: ✅ Loaded`);
console.log(`PROVIDER_NAME: ${PROVIDER_NAME}`);
console.log(`PROVIDER_VERSION: ${PROVIDER_VERSION}`);

const endpoint = `${PACTFLOW_URL}/contracts/provider/${PROVIDER_NAME}/version/${PROVIDER_VERSION}/consumer/Mobile/verification-results`;

console.log(`endpoint: ${endpoint}`);

(async () => {
  try {
    console.log(`📤 Publishing provider verification result to PactFlow...`);
    const res = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ Verification published! Response status: ${res.status}`);
  } catch (error) {
    console.error('❌ Failed to upload verification result:', {
      status: error.response?.status,
      data: error.response?.data,
    });
    process.exit(1);
  }
})();
