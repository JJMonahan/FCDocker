const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const axios = require('axios');

const PACTFLOW_URL = process.env.PACTFLOW_URL;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;
const PROVIDER_NAME = process.env.PROVIDER_NAME;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION;

const consumerVersionSelectors = [
  { tag: 'latest' } // Switched from mainBranch to tag for better compatibility
];

async function verifyBiDirectionalContract() {
  const endpoint = `${PACTFLOW_URL}/bi-directional/verification`;

  const payload = {
    provider: PROVIDER_NAME,
    providerVersion: PROVIDER_VERSION,
    consumerVersionSelectors
  };

  console.log('📡 Sending Bi-Directional Verification request to PactFlow...');
  console.log('🔍 Endpoint:', endpoint);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Bi-Directional Verification succeeded!');
    console.log(`🔍 Response: ${res.status} ${res.statusText}`);
  } catch (err) {
    if (err.response) {
      console.error('❌ PactFlow responded with an error:', err.response.data);
      console.error('🔁 Status:', err.response.status);
    } else {
      console.error('❌ Error during request:', err.message);
    }
    process.exit(1);
  }
}

verifyBiDirectionalContract();
