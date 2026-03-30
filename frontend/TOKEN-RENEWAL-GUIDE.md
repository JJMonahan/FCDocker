# API Drift Verification - Token Renewal Guide

## Issue: Token Expired 🔑

Your SwaggerHub API token has expired. Here's how to fix it:

### Step 1: Get New SwaggerHub API Token

1. **Login to SwaggerHub**: Go to [app.swaggerhub.com](https://app.swaggerhub.com)
2. **Access Settings**: Click your profile → Account Settings
3. **Generate Token**: Go to "API Keys" section
4. **Create New Key**: Click "Create API Key"
5. **Copy Token**: Save the new token securely

### Step 2: Update Environment

```powershell
# Update .env.local file
echo "SWAGGERHUB_API_TOKEN=your-new-token-here" > .env.local

# Or set environment variable directly
$env:SWAGGERHUB_API_TOKEN = "your-new-token-here"
```

### Step 3: Re-run Drift Verification

```powershell
# Using our Node.js script
node drift-verify.js

# Or using npm script
npm run drift:verify
```

## Alternative: Public API Access 🌐

If your SwaggerHub API is public, you can access it without authentication:

```javascript
// Try accessing public SwaggerHub URL
const publicUrl = "https://api.swaggerhub.com/apis/Monahan-Tutorials/Full-Contact-Django-extract/1.0.2/swagger.json";

// Or use the SwaggerHub registry URL
const registryUrl = "https://app.swaggerhub.com/apis-docs/Monahan-Tutorials/Full-Contact-Django-extract/1.0.2/swagger.json";
```

## Alternative: Manual Verification 📋

You can also manually compare specs:

1. **Download SwaggerHub Spec**:
   - Visit: https://app.swaggerhub.com/apis/Monahan-Tutorials/Full-Contact-Django-extract/1.0.2
   - Export as JSON

2. **Get Local Schema**:
   ```powershell
   Invoke-WebRequest http://localhost:8000/schema/ | ConvertFrom-Json > local-schema.json
   ```

3. **Compare Files**: Use any JSON diff tool or text editor

## Quick Health Check 🩺

Test that your local API is working:

```powershell
# Run our basic API verification
node simple-api-verify.js

# Check key endpoints
Invoke-WebRequest http://localhost:8000/api/companies/
Invoke-WebRequest http://localhost:8000/api/contacts/
Invoke-WebRequest http://localhost:8000/schema/
```

## Token Management Best Practices 🛡️

1. **Token Security**: Don't commit tokens to git
2. **Token Rotation**: Renew tokens regularly (30-90 days)
3. **Environment Files**: Use .env.local for sensitive data
4. **Backup Tokens**: Keep a backup token for emergencies

## Need Help? 🆘

If you continue having issues:

1. Check SwaggerHub API status
2. Verify API permissions in SwaggerHub
3. Ensure your organization has API access enabled
4. Contact SwaggerHub support if needed

---

**Next Steps**: 
1. Get new SwaggerHub API token
2. Update .env.local file
3. Re-run: `node drift-verify.js`