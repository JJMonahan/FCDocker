const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { execSync } = require("child_process");

const PACTFLOW_TOKEN = process.env.PACTFLOW_TOKEN;
const PACTFLOW_URL = process.env.PACTFLOW_URL || "https://monahan-tutorials.pactflow.io";
const PROVIDER_NAME = process.env.PROVIDER_NAME || "Full-Contact-Django-extract";
const CONSUMER_NAME = process.env.CONSUMER_NAME || "Website";
const CONSUMER_VERSION = process.env.CONSUMER_VERSION || "1.0.4";
const PACT_PATH = path.resolve(__dirname, "../pacts", `${CONSUMER_NAME}-${PROVIDER_NAME}.json`);

console.log("\n🔍 Validating consumer Pact against provider OpenAPI spec...");
console.log("--------------------------------------------");
console.log(`PACTFLOW_URL: ${PACTFLOW_URL}`);
console.log(`PACTFLOW_TOKEN: ${PACTFLOW_TOKEN ? "✅ Loaded" : "❌ Missing"}`);
console.log(`CONSUMER_NAME: ${CONSUMER_NAME}`);
console.log(`CONSUMER_VERSION: ${CONSUMER_VERSION}`);
console.log(`PROVIDER_NAME: ${PROVIDER_NAME}`);
console.log(`PACT_PATH: ${PACT_PATH}`);
console.log("--------------------------------------------\n");

try {
  const cmd = `npx @pactflow/openapi-cli validate consumer \
    --pact-url ${PACT_PATH} \
    --provider-name ${PROVIDER_NAME} \
    --broker-url ${PACTFLOW_URL} \
    --broker-token ${PACTFLOW_TOKEN}`;

  console.log(`🚀 Running:
${cmd}\n`);
  const result = execSync(cmd, { stdio: "inherit" });
  console.log("✅ Consumer verification against OpenAPI spec completed successfully.");
} catch (error) {
  console.error("❌ Consumer validation failed:", error.message);
  process.exit(1);
}

