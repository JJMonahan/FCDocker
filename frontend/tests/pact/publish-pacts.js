const path = require('path');
const { publishPacts } = require('@pact-foundation/pact-node');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 🔧 CONFIGURE HERE:
const pactDir = path.resolve(__dirname, '../../pacts');
const consumerVersion = process.env.CONSUMER_VERSION;
const brokerUrl = process.env.PACTFLOW_URL;
const brokerToken = process.env.PACTFLOW_TOKEN;
const consumerName = process.env.CONSUMER_NAME;
const branch = process.env.BRANCH || 'main';

(async () => {
  try {
    console.log(`🚀 Publishing all Pact files from: ${pactDir}`);
    console.log(`🔖 Using version: ${consumerVersion}`);
    console.log(`🌿 Branch: ${branch}`);
    console.log(`🔐 Broker: ${brokerUrl}`);
    console.log(`👤 Consumer: ${consumerName}`);
    console.log("");

    // Step 1: Publish the Pact file(s)
    await publishPacts({
      pactFilesOrDirs: [pactDir],
      pactBroker: brokerUrl,
      consumerVersion,
      pactBrokerToken: brokerToken,
      tags: ['latest', consumerVersion],
      branch,
    });

    console.log('✅ Pact contracts published successfully!');

    // Step 2: Use HAL discovery to get participant version URL
    const rootUrl = brokerUrl.endsWith('/') ? brokerUrl : `${brokerUrl}/`;
    const rootRes = await axios.get(rootUrl, {
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        Accept: 'application/hal+json',
      },
    });

    const pacticipantsLink = rootRes.data?._links?.['pb:pacticipants']?.href;
    if (!pacticipantsLink) {
      throw new Error("❌ HAL root did not contain 'pb:pacticipants' link. Cannot continue.");
    }

    // Fetch all participants and match ours
    const pacticipantsRes = await axios.get(pacticipantsLink, {
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        Accept: 'application/hal+json',
      },
    });

    const participant = pacticipantsRes.data?._embedded?.pacticipants?.find(
      p => p.name === consumerName
    );

    if (!participant) {
      throw new Error(`❌ Could not find participant "${consumerName}" in PactFlow.`);
    }

    const versionsUrl = participant._links?.['pb:versions']?.href;
    if (!versionsUrl) {
      throw new Error(`❌ Could not find versions link for participant "${consumerName}".`);
    }

    const versionsRes = await axios.get(versionsUrl, {
      headers: {
        Authorization: `Bearer ${brokerToken}`,
        Accept: 'application/hal+json',
      },
    });

    const versions = versionsRes.data?._embedded?.versions || [];

    if (versions.length === 0) {
      console.error(`❌ No versions found for ${consumerName}. Publishing may have failed.`);
      process.exit(1);
    }

    console.log(`📦 Found ${versions.length} version(s) for ${consumerName}:`);
    versions.forEach(v => {
      console.log(`- ${v.number} (branch: ${v.branch || 'N/A'})`);
    });

    const versionMatch = versions.find(v => v.number === consumerVersion);
    if (versionMatch) {
      console.log(`✅ Verified: version ${consumerVersion} is visible in PactFlow.`);
    } else {
      console.warn(`⚠️ Version ${consumerVersion} not found in the version list.`);
    }

  } catch (err) {
    if (err.response) {
      console.error('❌ HTTP error:', err.response.status, err.response.data);
    } else {
      console.error('❌ Unexpected error:', err.message || err);
    }
    process.exit(1);
  }
})();

