const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const axios = require('axios');

const ENV_MISSING = "Undefined - check .env file.";

const SWAGGERHUB_API_KEY = process.env.SWAGGERHUB_API_KEY || ENV_MISSING;
const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN || ENV_MISSING;
const PACT_BROKER_TOKEN = process.env.PACT_BROKER_TOKEN || ENV_MISSING;
const PACTFLOW_URL = process.env.PACTFLOW_URL || ENV_MISSING;
const PACT_BROKER_BASE_URL = process.env.PACT_BROKER_BASE_URL || ENV_MISSING;
const PACTFLOW_CONSUMER = process.env.PACTFLOW_CONSUMER || ENV_MISSING;
const PACT_PROVIDER = process.env.PACT_PROVIDER || ENV_MISSING;
const PROVIDER_VERSION = process.env.PROVIDER_VERSION || ENV_MISSING;
const CONSUMER_NAME = process.env.CONSUMER_NAME || ENV_MISSING;
const CONSUMER_VERSION = process.env.CONSUMER_VERSION || ENV_MISSING;
const PROVIDER_NAME = process.env.PROVIDER_NAME || ENV_MISSING;
const PROVIDER_BASE_URL = process.env.PROVIDER_BASE_URL || ENV_MISSING;
const OWNER = process.env.OWNER || ENV_MISSING;
const API = process.env.API || ENV_MISSING;
const BRANCH = process.env.BRANCH || ENV_MISSING;

const swaggerUrl = `https://api.swaggerhub.com/apis/${OWNER}/${API}/${PROVIDER_VERSION}?resolved=true;flatten=true`;

logEnv();
listAllPactflowParticipants();
listAllRelationshipsViaIntegrations();
listAllLegacyPacts();

function logEnv() {
  console.log('-------------- SETTINGS ---------------');
  console.log("SWAGGERHUB_API_KEY:", SWAGGERHUB_API_KEY);
  console.log("PACTFLOW_TOKEN:", PACTFLOW_TOKEN);
  console.log("PACT_BROKER_TOKEN:", PACT_BROKER_TOKEN);
  console.log("PACTFLOW_URL:", PACTFLOW_URL);
  console.log("PACT_BROKER_BASE_URL:", PACT_BROKER_BASE_URL);
  console.log("PACTFLOW_CONSUMER:", PACTFLOW_CONSUMER);
  console.log("PACT_PROVIDER:", PACT_PROVIDER);
  console.log("PROVIDER_VERSION:", PROVIDER_VERSION);
  console.log("CONSUMER_NAME:", CONSUMER_NAME);
  console.log("CONSUMER_VERSION:", CONSUMER_VERSION);
  console.log("PROVIDER_NAME:", PROVIDER_NAME);
  console.log("PROVIDER_BASE_URL:", PROVIDER_BASE_URL);
  console.log("OWNER:", OWNER);
  console.log("BRANCH:", BRANCH);
  console.log('--------------------------------------------\n');
}

async function listAllPactflowParticipants() {
  if (PACTFLOW_URL === ENV_MISSING || PACTFLOW_TOKEN === ENV_MISSING) {
    console.error("❌ Missing required environment variables.");
    return;
  }

  try {
    const rootUrl = PACTFLOW_URL.endsWith('/') ? PACTFLOW_URL : `${PACTFLOW_URL}/`;
    const rootRes = await axios.get(rootUrl, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        Accept: 'application/hal+json',
      },
    });

    const pacticipantsLink = rootRes.data._links?.['pb:pacticipants']?.href;
    if (!pacticipantsLink) {
      console.error("❌ 'pb:pacticipants' link not found in HAL response.");
      return;
    }

    const participantsRes = await axios.get(pacticipantsLink, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        Accept: 'application/hal+json',
      },
    });

    const participants = participantsRes.data._embedded?.pacticipants || [];

    console.log("✅ All PactFlow participants and their relationships:");

    const connections = {}; // Map participant -> { consumers: Set, providers: Set }

    for (const participant of participants) {
      const name = participant.name;
      connections[name] = { consumers: new Set(), providers: new Set() };

      const latestProviderPactsLink = participant._links?.['pb:latest-provider-pacts']?.href;
      const latestPactsLink = participant._links?.['pb:latest-pacts']?.href;

      // As consumer (who consumes which provider)
      if (latestProviderPactsLink) {
        const res = await axios.get(latestProviderPactsLink, {
          headers: {
            Authorization: `Bearer ${PACTFLOW_TOKEN}`,
            Accept: 'application/hal+json',
          },
        });
        const pacts = res.data._embedded?.pacts || [];
        pacts.forEach(p => {
          connections[name].providers.add(p.providerName);
        });
      }

      // As provider (who consumes this participant)
      if (latestPactsLink) {
        const res = await axios.get(latestPactsLink, {
          headers: {
            Authorization: `Bearer ${PACTFLOW_TOKEN}`,
            Accept: 'application/hal+json',
          },
        });
        const pacts = res.data._embedded?.pacts || [];
        pacts.forEach(p => {
          connections[name].consumers.add(p.consumerName);
        });
      }
    }

    // 🖨️ Print out each participant with their role-based connections
    for (const [name, { consumers, providers }] of Object.entries(connections)) {
      console.log(`\n🔎 ${name}`);
      if (consumers.size > 0) {
        console.log(`  📥 Consumers:`);
        consumers.forEach(c => console.log(`    - ${c}`));
      } else {
        console.log(`  📥 Consumers: (none)`);
      }

      if (providers.size > 0) {
        console.log(`  📤 Providers:`);
        providers.forEach(p => console.log(`    - ${p}`));
      } else {
        console.log(`  📤 Providers: (none)`);
      }
    }

  } catch (err) {
    console.error("❌ Error fetching participants or connections:", err.response?.data || err.message);
  }
}

async function listAllRelationshipsViaIntegrations() {
  const integrationsUrl = `${PACTFLOW_URL}/integrations`;

  try {
    const res = await axios.get(integrationsUrl, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        Accept: 'application/hal+json',
      },
    });

    const integrations = res.data._embedded?.integrations || [];

    console.log("\n🔗 Consumer-Provider Relationships via /integrations:");
    integrations.forEach(integration => {
      const consumer = integration.consumer?.name;
      const provider = integration.provider?.name;
      const verified = integration.latestVerificationResult?.success;

      console.log(` - ${consumer} ➡️ ${provider}${verified === true ? ' ✅' : verified === false ? ' ❌' : ''}`);
    });
  } catch (err) {
    console.error("❌ Failed to fetch relationships from /integrations:", err.response?.data || err.message);
  }
}


async function inspectParticipant(participant, relationships) {
  const participantName = participant.name;
  try {
    const versionsUrl = participant._links?.['pb:versions']?.href;
    const latestPactsLink = participant._links?.['pb:latest-pacts']?.href;
    const latestProviderPactsLink = participant._links?.['pb:latest-provider-pacts']?.href;

    if (versionsUrl) {
      const versionsRes = await axios.get(versionsUrl, {
        headers: {
          Authorization: `Bearer ${PACTFLOW_TOKEN}`,
          Accept: 'application/hal+json',
        },
      });
      const versions = versionsRes.data._embedded?.versions || [];

      console.log(`\n🔎 Participant: ${participantName}`);
      versions.forEach(v => {
        console.log(`- Version: ${v.number}, Branch: ${v.branch || 'N/A'}, Created: ${v.createdAt}`);
        if (v.tags && v.tags.length > 0) {
          console.log(`  Tags: ${v.tags.map(t => t.name).join(', ')}`);
        } else {
          console.log("  Tags: (none)");
        }
      });
    }

    if (latestPactsLink) {
      const pactsRes = await axios.get(latestPactsLink, {
        headers: {
          Authorization: `Bearer ${PACTFLOW_TOKEN}`,
          Accept: 'application/hal+json',
        },
      });
      const pacts = pactsRes.data._embedded?.pacts || [];
      if (pacts.length > 0) {
        console.log(`📡 ${participantName} is a provider to:`);
        pacts.forEach(p => {
          console.log(`  - ${p.consumerName}`);
          relationships.push({ from: p.consumerName, to: participantName });
        });
      }
    }

    if (latestProviderPactsLink) {
      const provPactsRes = await axios.get(latestProviderPactsLink, {
        headers: {
          Authorization: `Bearer ${PACTFLOW_TOKEN}`,
          Accept: 'application/hal+json',
        },
      });
      const pacts = provPactsRes.data._embedded?.pacts || [];
      if (pacts.length > 0) {
        console.log(`📡 ${participantName} is a consumer of:`);
        pacts.forEach(p => {
          console.log(`  - ${p.providerName}`);
          relationships.push({ from: participantName, to: p.providerName });
        });
      }
    }
  } catch (err) {
    console.error(`❌ Failed to inspect ${participantName}:`, err.response?.data || err.message);
  }
}

async function listAllLegacyPacts() {
  console.log("\n📄 Checking legacy Pact contracts via /pacts/latest endpoint...");
  try {
    const latestPactsUrl = `${PACTFLOW_URL}/pacts/latest`; // legacy pacts endpoint
    const res = await axios.get(latestPactsUrl, {
      headers: {
        Authorization: `Bearer ${PACTFLOW_TOKEN}`,
        Accept: 'application/hal+json',
      },
    });

    const pacts = res.data._embedded?.pacts || [];
    if (pacts.length === 0) {
      console.log("⚠️  No legacy pacts found.");
      return;
    }

    console.log(`✅ Found ${pacts.length} legacy pact(s):`);
    pacts.forEach(p => {
      console.log(`- Consumer: ${p.consumer?.name} ➡️ Provider: ${p.provider?.name}`);
      console.log(`  Consumer Version: ${p.consumerVersionNumber}, Tags: ${(p.tags || []).join(', ') || '(none)'}`);
      console.log(`  Pact Link: ${p._links?.self?.href}`);
    });
  } catch (err) {
    console.error("❌ Failed to list legacy pacts:", err.response?.data || err.message);
  }
}
