import os
from pact.verifier import Verifier

# PactFlow configuration
PACTFLOW_URL = "https://monahan-tutorials.pactflow.io"  # Your PactFlow broker URL
PACT_BROKER_TOKEN = "WgrbL41d82yvPCSWP84IwA"  # For demo only - use env vars in production

# Provider settings
PROVIDER_NAME = "DjangoAPI"  # Replace with your provider name
PROVIDER_URL = "http://172.30.179.80:8000"  # Django API base URL

# Verify provider against all pacts in PactFlow
def verify_provider():

    print(f"PactFlow URL: {PACTFLOW_URL}")
    print(f"PactFlow Token: {PACT_BROKER_TOKEN}")
    print(f"Provider Name: {PROVIDER_NAME}")
    print(f"Provider URL: {PROVIDER_URL}")

    verifier = Verifier(
        provider=PROVIDER_NAME,
        provider_base_url=PROVIDER_URL
    )
    
    result = verifier.verify_with_broker(
        broker_url=PACTFLOW_URL,
        broker_token=PACT_BROKER_TOKEN,
        verbose=True
    )

    if result == 0:
        print("✅ Provider verification successful!")
    else:
        print("❌ Provider verification failed.")
    
    return result

if __name__ == "__main__":
    verify_provider()
