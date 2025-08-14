# Speed of Mastery Deployment Configuration

## Environment Variables Required for Deployment

### Cloudflare Pages Environment Variables
```
NEXT_PUBLIC_APP_NAME=Speed of Mastery
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_WORKER_URL=https://speed-of-mastery-rag.your-subdomain.workers.dev
NODE_ENV=production
```

### Cloudflare Worker Environment Variables (wrangler.toml)
```
ENVIRONMENT=production
RAG_SYSTEM_VERSION=1.0.0
MAX_CHUNK_SIZE=1000
EMBEDDING_MODEL=text-embedding-ada-002
EXTERNAL_DB_PROD_ID=96428fab-9de1-4a87-989b-d04dac998c3e
EXTERNAL_DB_DEV_ID=dc70fb43-a66c-46a7-8b9b-da654c59fc72
EXTERNAL_REGISTRATION_URL=https://cd11a3fd.token-forge-app-new.pages.dev
```

## Database Setup Commands
```bash
# Create D1 database
wrangler d1 create speed-of-mastery-db

# Apply schema
wrangler d1 execute speed-of-mastery-db --file=./schema.sql

# Create R2 bucket
wrangler r2 bucket create speed-of-mastery-lessons

# Create Vectorize index
wrangler vectorize create speed-of-mastery-lessons --dimensions=768
```

## Deployment Commands
```bash
# Deploy Cloudflare Worker
wrangler deploy --env production

# Build and deploy Next.js app to Cloudflare Pages
npm run build
```
