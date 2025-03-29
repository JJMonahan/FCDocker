#!/usr/bin/env node

const { execSync } = require("child_process");

// ✅ Configuration
const PACTICIPANT = "DjangoAPI"; // Must match what's in PactFlow
const VERSION = "0.1.0";         // Must match what's published
const ENVIRONMENT = "Production";
const BROKER_URL = "https://monahan-tutorials.pactflow.io";
const BROKER_TOKEN = "WgrbL41d82yvPCSWP84IwA";

if (!BROKER_TOKEN) {
  console.error("❌ Missing environment variable: PACT_BROKER_TOKEN");
  process.exit(1);
}

const command = `npx pact-broker record-deployment \
  --pacticipant "${PACTICIPANT}" \
  --version "${VERSION}" \
  --environment "${ENVIRONMENT}" \
  --broker-base-url "${BROKER_URL}" \
  --broker-token "${BROKER_TOKEN}"`;


console.log(`📦 Marking ${PACTICIPANT} v${VERSION} as deployed to ${ENVIRONMENT}...`);

try {
  execSync(command, { stdio: "inherit" });
  console.log("✅ Deployment recorded in PactFlow.");
} catch (err) {
  console.error("❌ Failed to record deployment:", err.message);
  process.exit(1);
}
