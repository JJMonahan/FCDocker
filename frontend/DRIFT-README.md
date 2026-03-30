# PactFlow Drift Integration for FCDocker

This integration adds **API contract verification** to the FCDocker project using PactFlow Drift, ensuring your Django REST API implementation matches its OpenAPI specification.

## 🎯 What is PactFlow Drift?

PactFlow Drift is a **contract verification tool** that tests whether your running API implementation matches its OpenAPI specification. It sends real HTTP requests to your API and validates responses against your OpenAPI contract, catching discrepancies between documentation and implementation.

**Key Difference from Pact:**
- **Pact**: Tests consumer-provider contract compatibility  
- **Drift**: Tests provider implementation vs. OpenAPI specification

## 🏗️ Architecture Integration

```
Django REST API (Backend)
    ↓ (OpenAPI spec at /schema/)
PactFlow Drift ← Verifies implementation matches spec
    ↓ (HTTP requests + validation)
Vue.js Frontend 
    ├── Pact Tests (Consumer-Provider contracts)
    └── Drift Verification (API-spec compliance) ← NEW!
```

## 📦 Installation & Setup

### Fresh Clone Setup (New Computer/Developer)

If you're cloning this repo to a new computer, follow these steps:

```bash
# 1. Clone and navigate to frontend
git clone <repo-url>
cd FCDocker/frontend

# 2. Install Node.js dependencies
npm install

# 3. Set up environment configuration
cp .env.example .env.local
# Edit .env.local and add your SwaggerHub API token

# 4. Start Docker services (required for API testing)
cd ..
docker-compose up -d

# 5. Verify API is running
cd frontend
npm run api:verify

# 6. Test drift setup
npm run drift:test-setup

# 7. Authenticate with PactFlow (one-time)
npm run drift:auth
```

### Prerequisites
1. **Node.js** (v16+) and **npm**
2. **Docker** and **Docker Compose** 
3. **SwaggerHub Account**: Get API token from SwaggerHub → Settings → API Keys
4. **PactFlow Account**: Sign up at [pactflow.io](https://pactflow.io) for free trial

## 🚀 Usage

### Basic Commands

```bash
# Authenticate (first-time setup)
npm run drift:auth

# Verify your API against OpenAPI spec
npm run drift:verify

# Interactive setup guide
npm run drift:init

# Run both Pact tests and Drift verification  
npm run test:all
```

### Docker Integration

```bash
# Start your FCDocker stack
docker-compose up -d

# Wait for services to be ready (API accessible at localhost:8000)

# Verify API contracts 
npm run drift:verify
```

## 📋 Test Configuration

### Main Config: `drift.yaml`
Our configuration tests key Full Contact API endpoints:

```yaml
# Test case structure
drift-testcase-file: v1
title: "Full Contact API Verification"  
sources:
  - name: fullcontact-oas
    uri: http://localhost:8000/schema/
plugins:
  - name: oas
  - name: json
operations:
  getCompanies_Success:    # Test company list
  getContacts_Success:     # Test contact list  
  createCompany_Success:   # Test company creation
  getMobileStatus_Success: # Test status endpoints
```

### What Gets Tested

Each operation tests:
- ✅ **HTTP Status Codes** - Correct response codes (200, 201, etc.)
- ✅ **Response Schema** - JSON structure matches OpenAPI spec
- ✅ **Required Fields** - All required response fields present
- ✅ **Data Types** - Field types match specification
- ✅ **Headers** - Content-Type and other headers correct

## 🔄 Workflow Integration

### Enhanced API Testing Pipeline

Your **current Pact workflow**:
```bash
npm run test:pact          # Test consumer-provider contracts
npm run publish-pacts      # Publish contracts to broker  
npm run verify-provider    # Verify provider compliance
```

**Enhanced workflow with Drift**:
```bash
npm run test:pact          # Test consumer-provider contracts
npm run drift:verify       # Verify API vs OpenAPI spec ← NEW!
npm run publish-pacts      # Publish contracts to broker
```

### Example Drift Output
```
─[ Summary ]──────────────────────────────────────────────────
Executed 1 test case (1 passed, 0 failed)
Executed 4 operations (4 passed, 0 failed, 0 skipped)
Execution time 1.23456789s

┌─────────────────────────────┬────────────────────────┬─────────────────────────────┬────────┐
│ Testcase                    ┆ Operation              ┆ Target                      ┆ Result │
╞═════════════════════════════╪════════════════════════╪═════════════════════════════╪════════╡
│ Full Contact API Verification│ getCompanies_Success   ┆ fullcontact-oas:company_list┆ OK     │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│                             ┆ getContacts_Success    ┆ fullcontact-oas:contact_list┆ OK     │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│                             ┆ createCompany_Success  ┆ fullcontact-oas:company_create┆ OK   │
├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┼╌╌╌╌╌╌╌╌┤
│                             ┆ getMobileStatus_Success┆ fullcontact-oas:mobile_status┆ OK    │
└─────────────────────────────┴────────────────────────┴─────────────────────────────┴────────┘
```

### CI/CD Integration

Add to your pipeline:
```yaml
# Example GitHub Actions step
- name: API Drift Detection
  run: |
    npm run drift:baseline  # Only on main branch
    npm run drift:detect
    
- name: Upload Drift Report
  uses: actions/upload-artifact@v3
  with:
    name: drift-report
    path: drift-reports/
```

## 🎛️ Available APIs

The system monitors these Full Contact API endpoints:

| Endpoint | Description | Methods |
|----------|-------------|---------|
| `/api/companies/` | Company management | GET, POST, PUT, DELETE |
| `/api/contacts/` | Contact management | GET, POST, PUT, DELETE |
| `/api/notes/` | Notes system | GET, POST, PUT, DELETE |
| `/api/roles/` | Role management | GET, POST, PUT, DELETE |
| `/api/jobs/` | Job tracking | GET, POST, PUT, DELETE |
| `/api/logs/` | Activity logs | GET, POST, PUT, DELETE |
| `/api/mobile/` | Mobile status | GET |
| `/api/desktop/` | Desktop status | GET |
| `/api/website/` | Website status | GET |
| `/api/tablet/` | Tablet status | GET |

## ✅ What Drift Validates

### Contract Compliance Checks

1. **Response Structure** ✅
   - JSON schema validation against OpenAPI spec
   - Required fields presence  
   - Data type correctness

2. **HTTP Semantics** ✅  
   - Status code compliance (200, 201, 404, etc.)
   - Content-Type headers
   - Response format (JSON/XML/etc.)

3. **API Behavior** ✅
   - Endpoint availability
   - Request/response cycles
   - Error handling consistency

### Benefits vs Manual Testing

- **Automated**: No manual API testing needed
- **Comprehensive**: Tests entire OpenAPI specification  
- **Fast**: Parallel execution of test operations
- **Reliable**: Consistent validation across environments
- **Documentation-Driven**: Ensures docs match reality

## � Troubleshooting

### Common Issues

1. **"Authentication required"**
   ```bash
   npm run drift:auth  # Login to PactFlow
   ```

2. **"Connection refused"** 
   - Ensure Docker containers running: `docker-compose up -d`
   - Check API accessible: `curl http://localhost:8000/schema/`
   - Verify Django server is healthy

3. **"Operation ID not found"**
   - Check OpenAPI spec has operationId for endpoints
   - Update drift.yaml target names to match spec
   - Use Django's spectacular.views for better OpenAPI generation

4. **"JSON Schema validation failed"**
   - API response doesn't match OpenAPI specification
   - Check Django serializers align with OpenAPI definition
   - Review response structure vs documented schema

### Debugging Failed Tests

```bash
# Run specific operations only
npx @pactflow/drift verify --test-files drift.yaml --server-url http://localhost:8000 --operations getCompanies_Success

# Enable debug output  
npx @pactflow/drift verify --test-files drift.yaml --server-url http://localhost:8000 --debug
```

## 📈 Next Steps

1. **Authenticate**: 
   ```bash
   npm run drift:auth  # Setup PactFlow credentials
   ```

2. **Start Docker & Test**:
   ```bash
   docker-compose up -d     # Start FCDocker services
   npm run drift:verify     # Verify API contracts
   ```

3. **Customize Tests**: Edit [`drift.yaml`](drift.yaml) to add/modify test operations

4. **CI/CD Integration**: Add `npm run test:all` to your pipeline

5. **Team Adoption**: Share results - Drift ensures API docs accuracy!

## 📚 Resources

- **[Official PactFlow Drift Docs](https://pactflow.github.io/drift-docs/)**
- **[Getting Started Tutorial](https://pactflow.github.io/drift-docs/docs/tutorials/getting-started)**  
- **[PactFlow Free Trial](https://pactflow.io/)**
- [Existing Pact Tests](./tests/pact/) (in your project)
- [Django OpenAPI Schema](http://localhost:8000/schema/swagger-ui/)

---

**🎉 Result**: You now have **comprehensive API testing** combining:
- **Pact**: Consumer-Provider contract testing  
- **Drift**: API implementation vs specification verification ← NEW!  
- **Full Coverage**: Both contract compliance AND implementation accuracy!