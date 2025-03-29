#!/bin/bash

# 🔹 Set your PactFlow credentials
PACT_BROKER_BASE_URL="https://monahan-tutorials.pactflow.io"
PACT_BROKER_TOKEN="WgrbL41d82yvPCSWP84IwA"

# 🔹 Pact consumer version (increment as needed)
CONSUMER_APP_VERSION="1.0.1"

# 🔹 Directory where Pact JSON files are stored
PACT_DIR="../../pacts/"

# 🔹 Publish the Pact contract
pact-broker publish $PACT_DIR --consumer-app-version $CONSUMER_APP_VERSION \
  --broker-base-url $PACT_BROKER_BASE_URL \
  --broker-token $PACT_BROKER_TOKEN

echo "✅ Pact contract uploaded to PactFlow!"

