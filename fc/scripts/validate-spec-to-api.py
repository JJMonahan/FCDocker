import os
import subprocess
import requests

# === Step 1: Set Up Environment Variables ===
def setup_env_variables():
    """Ensure required environment variables are set."""
    required_env_vars = ["PACTFLOW_TOKEN"]
    for var in required_env_vars:
        if not os.getenv(var):
            value = input(f"Enter value for {var}: ")
            os.environ[var] = value
            print(f"✅ {var} set.")

setup_env_variables()

# PactFlow Configuration
PACT_BROKER_URL = "https://monahan-tutorials.pactflow.io/"
PACT_BROKER_TOKEN = os.getenv("PACTFLOW_TOKEN")
PACT_BROKER_TOKEN = "WgrbL41d82yvPCSWP84IwA"

# Django API Configuration
DJANGO_BASE_URL = "http://localhost:8000/api"  # Ensure Django is running

# OpenAPI Specification Path
SWAGGERHUB_API_URL = "https://api.swaggerhub.com/apis/Monahan-Tutorials/Full-Contact-Django-extract/0.1.0"
OPENAPI_SPEC_PATH = "swaggerhub.json"
SWAGGERHUB_API_TOKEN = "f0ac2773-012c-40d8-a9ec-aa0bf42e9d0a"

# === Step 2: Download OpenAPI Spec ===
def download_openapi_spec():
    """Download the OpenAPI spec from SwaggerHub."""
    headers = {
        "Authorization": f"Bearer {SWAGGERHUB_API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.get(SWAGGERHUB_API_URL, headers=headers)
    if response.status_code == 200:
        with open(OPENAPI_SPEC_PATH, "wb") as f:
            f.write(response.content)
        print("✅ OpenAPI spec downloaded successfully.")
    else:
        print(f"❌ Failed to download OpenAPI spec: {response.text}")
        exit(1)

# === Step 3: Publish OpenAPI Spec to PactFlow ===
def publish_openapi_spec():
    """Publish the OpenAPI spec to PactFlow."""
    headers = {
        "Authorization": f"Bearer {PACT_BROKER_TOKEN}",
        "Content-Type": "application/json"
    }

    with open(OPENAPI_SPEC_PATH, "rb") as f:
        response = requests.put(
            f"{PACT_BROKER_URL}/contracts/provider/DjangoAPI/version/1.0.0",
            headers=headers,
            data=f.read(),
        )

    if response.status_code in [200, 201]:
        print("✅ OpenAPI spec published to PactFlow.")
    else:
        print(f"❌ Failed to publish OpenAPI spec: {response.text}")
        exit(1)

# === Step 4: Run Provider Verification ===
def run_provider_verification():
    """Run Pact provider verification against Django API."""
    command = [
        "pact-verifier",
        f"--provider-base-url={DJANGO_BASE_URL}",
        f"--pact-broker-base-url={PACT_BROKER_URL}",
        "--provider=DjangoAPI",
        f"--broker-token={PACT_BROKER_TOKEN}",
    ]

    result = subprocess.run(command, capture_output=True, text=True)

    if result.returncode == 0:
        print("✅ Provider verification PASSED.")
    else:
        print(f"❌ Provider verification FAILED:\n{result.stderr}")
        exit(1)

if __name__ == "__main__":
    print("🚀 Starting PactFlow Provider Verification for Django API...")

    # Step 1: Download OpenAPI Spec from SwaggerHub
    download_openapi_spec()

    # Step 2: Publish OpenAPI Spec to PactFlow
    publish_openapi_spec()

    # Step 3: Verify Django API against the OpenAPI Spec
    run_provider_verification()
