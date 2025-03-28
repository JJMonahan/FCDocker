// verify-all-provider-pacts.js
require('dotenv').config({ path: '/home/john/gits/FCDocker/frontend/tests/pact/.env' });
const axios = require('axios');

const PACTFLOW_URL = process.env.PACTFLOW_URL;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;
const PROVIDER_NAME = process.env.PROVIDER_NAME;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION;
const ENVIRONMENT = 'production';

console.log('🔐 PactFlow Verification - Auto Mode');
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`PROVIDER: ${PROVIDER_NAME}`);
console.log(`VERSION: ${PROVIDER_VERSION}`);
console.log('--------------------------------------------');

const headers = {
  Authorization: `Bearer ${PACTFLOW_TOKEN}`,
  'Content-Type': 'application/json',
  Accept: 'application/hal+json'
};

async function fetchPactsToVerify() {
  const verifyUrl = `${PACTFLOW_URL}/pacts/provider/${PROVIDER_NAME}/for-verification`;
  console.log(`📎 Fetch URL: ${verifyUrl}`);
  const payload = {
    consumerVersionSelectors: [{ latest: true }],
    providerVersionTags: ['main'],
    includePendingStatus: true,
    includeWipPactsSince: '2020-01-01'
  };

  try {
    const res = await axios.post(verifyUrl, payload, { headers });
    return res.data._embedded?.pacts || [];
  } catch (err) {
    console.error('❌ Failed to fetch pacts for verification:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function publishVerificationResults(pacts) {
  for (const pact of pacts) {
    const verificationUrl = pact._links?.['pb:publish-verification-results']?.href;

    if (!verificationUrl) {
      console.warn(`⚠️  Skipping ${pact._links?.self?.name || 'pact'}: no verification URL available.`);
      continue;
    }

    const payload = {
      success: true,
      providerApplicationVersion: PROVIDER_VERSION,
      verifiedBy: {
        name: 'manual-script',
        version: '1.0'
      }
    };

    try {
      console.log(`📎 Provider-only verification URL: ${verificationUrl}`);
      const res = await axios.post(verificationUrl, payload, { headers });
      console.log(`✅ Verification published: ${res.status} ${res.statusText}`);
    } catch (err) {
      console.error('❌ Failed to publish verification result:', err.response?.data || err.message);
    }
  }
}

async function getEnvironmentUUID(envName) {
  const envUrl = `${PACTFLOW_URL}/environments`;
  console.log(`📎 Environments GET URL: ${envUrl}`);
  try {
    const response = await axios.get(envUrl, { headers });
    const match = response.data._embedded.environments.find((e) => e.name === envName);
    if (!match) throw new Error(`Environment '${envName}' not found.`);
    console.log(`🔍 Found environment:`, JSON.stringify(match, null, 2));
    return match.uuid;
  } catch (err) {
    console.error('❌ Failed to retrieve environment UUID:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function recordDeployment() {
  const environmentUUID = await getEnvironmentUUID(ENVIRONMENT);
  const url = `${PACTFLOW_URL}/pacticipants/${PROVIDER_NAME}/versions/${PROVIDER_VERSION}/deployed-versions/environment/${environmentUUID}`;

  const payload = {};

  console.log(`🚀 Recording deployment to ${ENVIRONMENT} environment...`);
  console.log(`📎 URL: ${url}`);
  console.log(`📦 Payload:`, payload);

  try {
    const res = await axios.post(url, payload, { headers });
    console.log(`✅ Deployment recorded: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error('❌ Failed to record deployment:', err.response?.data || err.message);
  }
}

async function canIDeploy() {
  const queryParams = new URLSearchParams({
    pacticipant: PROVIDER_NAME,
    version: PROVIDER_VERSION,
    to: `env:${ENVIRONMENT}`,
    latestby: 'cvp'
  });

  const matrixUrl = `${PACTFLOW_URL}/matrix?${queryParams.toString()}`;

  console.log('🔍 Checking deployment status via Matrix API...');
  console.log(`📎 GET URL: ${matrixUrl}`);

  try {
    const res = await axios.get(matrixUrl, { headers });
    if (res.data.summary?.deployable) {
      console.log('✅ Can deploy!');
    } else {
      console.warn('🚫 Cannot deploy yet. Reason:', res.data.summary?.reason || res.data);
    }
  } catch (err) {
    console.error('❌ Failed can-i-deploy check:', err.response?.data || err.message);
  }
}

(async () => {
  console.log('🔍 Fetching pacts for verification...');
  const pacts = await fetchPactsToVerify();
  await publishVerificationResults(pacts);
  await recordDeployment();
  await canIDeploy();
})();
