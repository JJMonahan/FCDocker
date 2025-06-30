const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const {
  PACTFLOW_URL,
  PACTFLOW_TOKEN,
  PROVIDER_NAME,
  PROVIDER_VERSION
} = process.env;

if (!PACTFLOW_URL || !PACTFLOW_TOKEN || !PROVIDER_NAME || !PROVIDER_VERSION) {
  console.error('❌ Missing required .env variables.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${PACTFLOW_TOKEN}`,
  Accept: 'application/hal+json',
  'Content-Type': 'application/json'
};

async function fetchPactsForProvider() {
  const url = `${PACTFLOW_URL}/pacts/provider/${PROVIDER_NAME}/for-verification`;
  const payload = {
    consumerVersionSelectors: [{ latest: true }],
    includePendingStatus: true
  };

  console.log(`🔍 Fetching pacts for ${PROVIDER_NAME}...`);
  try {
    const response = await axios.post(url, payload, { headers });
    return response.data._embedded?.pacts || [];
  } catch (err) {
    console.error('❌ Failed to fetch pacts:', err.message);
    process.exit(1);
  }
}

async function fakeVerificationResult(pact) {
  const publishUrl = pact._links?.['pb:publish-verification-results']?.href;
  if (!publishUrl) {
    console.warn(`⚠️ No publish link for pact: ${pact._links?.self?.href}`);
    return;
  }

  const payload = {
    success: true,
    providerApplicationVersion: PROVIDER_VERSION
  };

  console.log(`✅ Faking verification for: ${pact.consumer.name} → ${PROVIDER_NAME}`);
  try {
    const response = await axios.post(publishUrl, payload, { headers });
    console.log(`🔄 Published: ${response.status} ${response.statusText}`);
  } catch (err) {
    console.error(`❌ Failed to publish for ${pact.consumer.name}:`, err.message);
  }
}

(async () => {
  const pacts = await fetchPactsForProvider();
  if (!pacts.length) {
    console.log('⚠️ No pacts found for the provider.');
    return;
  }

  for (const pact of pacts) {
    await fakeVerificationResult(pact);
  }

  console.log('\n🎉 Demo verification results published to PactFlow.');
})();
