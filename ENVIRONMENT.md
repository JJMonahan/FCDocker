# Environment Configuration Guide

## Overview

This project now uses a **centralized environment configuration** with a single root-level `.env` file that feeds all services (frontend, backend, database, and testing tools).

## Quick Setup

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update with your actual credentials:**
   Edit `.env` with your tokens and settings

3. **Validate configuration:**
   ```bash
   npm run env:validate
   ```

4. **Start development environment:**
   ```bash
   npm run dev:start
   ```

## Production Deployment

1. **Set up production environment:**
   ```bash
   npm run env:copy-prod
   # Edit .env.production with production values
   ```

2. **Deploy to production:**
   ```bash
   npm run prod:start
   ```

## Environment Variables

### Database Configuration
- `POSTGRES_DB` - Database name (default: fullcontact)
- `POSTGRES_USER` - Database user (default: postgres)  
- `POSTGRES_PASSWORD` - Database password (default: postgres)
- `POSTGRES_HOST` - Database host for Django (default: postgres)
- `POSTGRES_PORT` - Internal database port (default: 5432)
- `POSTGRES_EXTERNAL_PORT` - Host-exposed port (default: 5433)

### Django Backend
- `DJANGO_SECRET_KEY` - Django secret key
- `DJANGO_DEBUG` - Debug mode (true/false)
- `DJANGO_ALLOWED_HOSTS` - Comma-separated allowed hosts

### External APIs  
- `SWAGGERHUB_API_TOKEN` - SwaggerHub API token
- `SWAGGERHUB_ORGANIZATION` - Your SwaggerHub organization
- `PACTFLOW_BROKER_BASE_URL` - PactFlow broker URL
- `PACTFLOW_BROKER_TOKEN` - PactFlow API token

### Application Settings
- `APP_VERSION` - Application version
- `APP_ENVIRONMENT` - Environment (development/staging/production)
- `NODE_ENV` - Node.js environment
- `BACKEND_URL` - Backend API URL (for frontend and tests)
- `FRONTEND_URL` - Frontend URL (for CORS configuration)
- `CORS_ALLOW_ALL` - Enable CORS for all origins (true/false, false for production)

## Architecture Benefits

✅ **Single Source of Truth** - All configuration in one place  
✅ **Environment Isolation** - Easy to manage different environments  
✅ **Security** - `.env` excluded from git, tokens not in code  
✅ **Container Integration** - Docker Compose reads from root `.env`  
✅ **Development Workflow** - Copy `.env.example` → edit → ready  
✅ **Team Consistency** - Everyone uses the same variable names  

## File Structure

```
FCDocker/
├── .env                 # ← YOUR ACTUAL CONFIG (gitignored)
├── .env.example         # ← Template file (committed)
├── docker-compose.yml   # ← Uses variables from .env
├── frontend/            
│   ├── vite.config.js   # ← Configured for VITE_ variables
│   └── (no .env files)  
├── fc/
│   └── fc/settings.py   # ← Uses os.environ.get()
└── package.json         # ← Root scripts for env management
```

## Migration from Old Structure

**Before:**
- `frontend/.env.local` - Tokens committed (security risk)
- `fc/fc/settings.py` - Hardcoded database credentials
- `docker-compose.yml` - Hardcoded postgres settings
- Multiple `.env` files with duplicated config

**After:**
- Single root `.env` file (gitignored)  
- All services read from environment variables
- Template `.env.example` for documentation
- Centralized configuration management

## Important Notes

- **Never commit `.env`** - Contains sensitive tokens
- **Always commit `.env.example`** - Template for other developers
- **Use VITE_ prefix** - For frontend environment variables in Vite
- **Restart containers** - After changing `.env` values run `docker-compose down && docker-compose up -d`

## Troubleshooting

- **Missing variables**: Run `npm run env:validate` to check if `.env` loads properly
- **Container issues**: Ensure `.env` exists and restart with `docker-compose up -d --force-recreate`  
- **Frontend variables**: Use `VITE_` prefix for variables accessed in Vue components
- **Drift testing**: Run `npm run drift:test` to execute API contract tests
- **Environment-specific issues**: Use correct env file with `npm run dev:start` or `npm run prod:start`

## New NPM Scripts

- `env:copy` - Copy development template to .env
- `env:copy-prod` - Copy production template to .env.production  
- `env:validate` - Test if environment loads correctly
- `dev:start` - Start with development environment
- `prod:start` - Start with production environment
- `drift:test` - Run drift contract testing