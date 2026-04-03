# FCDocker Architecture Guide

## 🏗️ Repository Structure

```
FCDocker/
├── .env                        # ← Environment configuration (gitignored)
├── .env.example               # ← Development template 
├── .env.production.example    # ← Production template
├── docker-compose.yml         # ← Container orchestration
├── package.json              # ← Workspace scripts & dependencies
├── ENVIRONMENT.md            # ← Environment setup guide
├── ARCHITECTURE.md           # ← This file
├── .gitignore                # ← Unified ignore patterns
│
├── fc/                       # ← Django Backend
│   ├── Dockerfile            
│   ├── requirements.txt      
│   ├── manage.py             
│   ├── fc/                   # Django project settings
│   ├── fcapi/               # Django app code
│   ├── pact/                # ← Provider contract testing
│   ├── pacts/               # Generated pact files
│   ├── drift/               # ← Provider API verification
│   └── package.json         # Backend testing scripts
│
├── frontend/                # ← Vue.js Frontend  
│   ├── Dockerfile           
│   ├── package.json         
│   ├── src/                 # Vue application code
│   ├── pacts/              # Consumer contract files
│   ├── drift.yaml          # ← Consumer API verification 
│   └── tests/              # Frontend tests
│
└── scripts/                # ← Development utilities
    ├── rundev.sh           # Local development (non-Docker)
    └── runprod.sh          # Production deployment guide
```

## 🐳 Container Architecture

### **Services**
- **postgres**: Database service with health checks
- **backend**: Django API server (port 8000) 
- **frontend**: Nginx-served Vue.js app (port 80)
- **frontend-dev**: Development Vue server with hot reload

### **Environment Integration**  
All containers read from root `.env` file:
- Database credentials  
- API tokens (SwaggerHub, PactFlow)
- CORS settings
- Application URLs

### **Volume Strategy**
- `pgdata`: Persistent PostgreSQL data
- `staticvolume`: Django static files shared with frontend
- `fc/fcapi/migrations`: Live reload for database migrations

## 🤝 Contract Testing Architecture

### **Two-Layer Testing Strategy**

1. **Provider Testing** (Backend - `fc/`)
   - **Pact**: Comprehensive provider verification (`fc/pact/`)
   - **Drift**: API specification compliance (`fc/drift/`)
   - **Scripts**: `npm run test:api` (runs both)

2. **Consumer Testing** (Frontend - `frontend/`)
   - **Drift**: Consumer-side contract verification
   - **Focus**: Ensuring frontend can consume backend APIs
   - **Script**: `npm run drift:verify`

### **Contract Testing Workflow**
```bash
# Full contract testing suite
npm run contracts:all

# Individual testing
npm run contracts:drift-provider    # Backend API compliance  
npm run contracts:drift-consumer    # Frontend consumption tests
npm run contracts:test             # Pact + Drift (backend)
```

## 🔧 Environment Management

### **Three-Environment Strategy**
1. **Development**: `.env` (local Docker development)
2. **Production**: `.env.production` (secure deployment)  
3. **Testing**: Environment variables for CI/CD

### **Configuration Hierarchy**
1. Environment files (`.env`)
2. Docker Compose variable substitution (`${VAR}`)
3. Container environment variables
4. Application configuration (Django settings, Vite config)

## 🚀 Deployment Workflows

### **Development** 
```bash
cp .env.example .env          # Copy environment template
# Edit .env with your tokens
npm run dev:start             # Start containers  
npm run frontend:dev          # Optional: local frontend dev
```

### **Production**
```bash
npm run env:copy-prod         # Copy production template
# Edit .env.production with secure values
npm run prod:start           # Deploy with production settings
```

### **Testing**
```bash
npm run test:all             # Frontend + contract testing
npm run contracts:all        # Full contract verification
```

## 🎯 Key Design Decisions

### **Monorepo Benefits**
- Single environment configuration
- Unified contract testing  
- Shared Docker orchestration
- Coordinated deployments

### **Container-First Approach**
- Development === Production environment
- Eliminates "works on my machine"
- Easy scaling and deployment
- Clean dependency isolation

### **Contract-Driven Development**
- Provider tests ensure API compliance
- Consumer tests verify frontend compatibility
- Drift testing catches API changes
- Pact testing validates contracts

## 🔒 Security Architecture

- **Environment variables**: All secrets in gitignored `.env` files
- **CORS configuration**: Environment-controlled for security
- **Production settings**: Separate template enforces secure practices
- **Container isolation**: Services communicate via Docker networking

## 📈 Scaling Considerations

- **Database**: PostgreSQL with persistent volumes
- **Backend**: Django with Gunicorn (production-ready)  
- **Frontend**: Nginx static serving (high performance)
- **Load balancing**: Ready for reverse proxy integration
- **Monitoring**: Health checks configured for all services