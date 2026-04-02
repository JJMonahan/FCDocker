curl -X POST "https://monahan-tutorials.pactflow.io/pacts/provider/Full-Contact-Django-extract/consumer/Tablet/verification" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PKFXDyUK236nkILwP0HIEw" \
  -d '{
    "verification": {
      "success": true,
      "provider_version": "1.0.1",
      "consumer_version": "1.0.11",
      "pact_urls": [
        "https://monahan-tutorials.pactflow.io/pacts/consumer/Tablet/provider/Full-Contact-Django-extract/1.0.11"
      ],
      "comments": "Provider successfully verified the pact contract."
    }
  }'


curl -X GET "https://monahan-tutorials.pactflow.io/pacts/consumer/Tablet/provider/Full-Contact-Django-extract" -H "Authorization: Bearer PKFXDyUK236nkILwP0HIEw"

curl -X GET "https://monahan-tutorials.pactflow.io/pacts/Tablet/Full-Contact-Django-extract/" -H "Authorization: Bearer PKFXDyUK236nkILwP0HIEw"
