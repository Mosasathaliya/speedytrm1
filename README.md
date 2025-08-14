# 🚀 Speed of Mastery RAG System

**English Learning for Arabic Speakers with AI-Powered RAG Technology**

A comprehensive English learning application built with Next.js and powered by Cloudflare's RAG (Retrieval-Augmented Generation) system. This app provides personalized English learning experiences for Arabic speakers with intelligent content retrieval, AI-powered explanations, and progress tracking.

## ✨ Features

### 🧠 AI-Powered Learning
- **RAG System**: Intelligent lesson retrieval using vector similarity search
- **Personalized Recommendations**: AI-generated learning paths based on user progress
- **Contextual Help**: Get help specific to your current lesson and questions
- **Conversation Practice**: AI-powered conversation practice with corrections
- **Grammar Explanations**: Detailed grammar explanations in Arabic with English examples
- **Vocabulary Exercises**: Dynamic vocabulary exercises tailored to your level
- **Pronunciation Guidance**: AI-powered pronunciation help and tips

### 📚 Complete Curriculum
- **56 Structured Lessons** covering beginner to intermediate English
- **12 Learning Units** with focused topics and progression
- **Bilingual Content**: Arabic explanations with English examples
- **Interactive Elements**: Games, quizzes, and practice exercises
- **Progress Tracking**: Comprehensive learning analytics and achievements

### 🏗️ Technical Architecture
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Cloudflare Workers with D1 Database
- **Storage**: Cloudflare R2 for lesson content
- **AI**: Cloudflare AI Gateway with multiple models
- **Vector Search**: Cloudflare Vectorize for similarity search
- **Authentication**: Secure login with Term 1 payment verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Cloudflare account
- Wrangler CLI installed

### 1. Install Dependencies
```bash
npm install
```

### 2. Authenticate with Cloudflare
```bash
wrangler login
```

### 3. Deploy Everything (Recommended)
```bash
# Make the deployment script executable
chmod +x deploy-cloudflare.sh

# Run the full deployment
./deploy-cloudflare.sh
```

### 4. Manual Deployment (Alternative)
```bash
# Create D1 database
npm run db:create

# Create R2 bucket
npm run r2:create

# Create Vectorize index
npm run vectorize:create

# Apply database schema
npm run db:migrate

# Deploy worker
npm run deploy
```

## 📁 Project Structure

```
speed-of-mastery-rag/
├── src/
│   ├── worker/           # Cloudflare Worker (RAG backend)
│   │   └── index.ts     # Main worker file with all RAG endpoints
│   ├── app/             # Next.js frontend (your existing app)
│   │   ├── (app)/
│   │   │   ├── home/    # Home dashboard
│   │   │   ├── learn/   # Learning center
│   │   │   └── ai/      # AI learning features
│   │   └── (auth)/
│   │       └── login/   # Authentication
│   └── lib/
│       └── ragService.ts # Frontend RAG service integration
├── wrangler.toml        # Cloudflare configuration
├── schema.sql           # Database schema
├── deploy-cloudflare.sh # Automated deployment script
├── lessons-rag-ready.json      # Structured lesson data
├── lesson-chunks-rag.json     # RAG-optimized content chunks
└── RAG_UPLOAD_INSTRUCTIONS.md # Detailed RAG setup guide
```

## 🌐 API Endpoints

### Core RAG Functions
- `POST /api/lessons/search` - Search lessons using vector similarity
- `POST /api/lessons/recommendations` - Get personalized learning recommendations
- `POST /api/lessons/help` - Get contextual help for lessons
- `POST /api/practice/conversation` - Practice conversations with AI
- `POST /api/grammar/explanation` - Get grammar explanations
- `POST /api/vocabulary/exercises` - Generate vocabulary exercises
- `POST /api/pronunciation/help` - Get pronunciation guidance

### Progress Tracking
- `POST /api/progress/update` - Update user progress
- `GET /api/progress/stats` - Get user statistics

### System Management
- `GET /api/health` - System health check
- `POST /api/upload/lessons` - Upload new lessons to RAG

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_RAG_API_URL=your_worker_url
NEXT_PUBLIC_RAG_SYSTEM_VERSION=1.0.0
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_D1_DATABASE_ID=your_database_id
NEXT_PUBLIC_R2_BUCKET_NAME=speed-of-mastery-lessons
NEXT_PUBLIC_VECTORIZE_INDEX_NAME=speed-of-mastery-lessons
```

### Wrangler Configuration
The `wrangler.toml` file is pre-configured with:
- Worker name and environments
- D1 database binding
- R2 storage binding
- Vectorize index binding
- AI Gateway binding

## 📚 Lesson Content

### Curriculum Overview
- **Total Lessons**: 56
- **Learning Units**: 12
- **Target Audience**: Arabic speakers learning English
- **Content Type**: Grammar, vocabulary, conversation, pronunciation
- **Language Support**: Arabic explanations with English examples

### Unit Structure
1. **It's a wonderful world!** - Tenses, auxiliary verbs, short answers
2. **Get happy!** - Emotions and feelings
3. **What time is it?** - Time expressions and daily routines
4. **Let's go shopping!** - Shopping vocabulary and conversations
5. **Food and dining** - Food vocabulary and restaurant conversations
6. **Travel and transportation** - Travel vocabulary and transportation
7. **Family and relationships** - Family vocabulary and relationship terms
8. **Work and careers** - Professional vocabulary and workplace language
9. **Health and wellness** - Health vocabulary and medical conversations
10. **Technology and internet** - Tech vocabulary and digital communication
11. **Entertainment and media** - Entertainment vocabulary and media language
12. **Advanced communication** - Advanced grammar and communication skills

## 🧪 Testing

### Test Worker Locally
```bash
npm run dev
```

### Test API Endpoints
```bash
# Health check
curl https://your-worker.your-subdomain.workers.dev/api/health

# Search lessons
curl -X POST https://your-worker.your-subdomain.workers.dev/api/lessons/search \
  -H "Content-Type: application/json" \
  -d '{"query": "English alphabet", "language": "ar", "limit": 5}'
```

### Test Database
```bash
# List databases
npm run db:list

# Execute queries
wrangler d1 execute speed-of-mastery-db --command="SELECT * FROM lessons LIMIT 5"
```

## 📊 Monitoring

### Cloudflare Dashboard
- **Workers**: Monitor worker performance and errors
- **D1**: Database performance and query analytics
- **R2**: Storage usage and access patterns
- **Vectorize**: Search performance and index health
- **AI Gateway**: AI model usage and costs

### Key Metrics
- API response times
- Search accuracy and relevance
- User engagement and progress
- AI model usage and costs
- Database query performance

## 🔒 Security

### Authentication
- User ID and password verification
- Term 1 payment verification
- Session management
- Route protection

### Data Protection
- CORS configuration
- Input validation
- SQL injection prevention
- Rate limiting (configurable)

## 🚀 Scaling

### Performance Optimization
- Vector search optimization
- Database indexing
- Content caching
- CDN distribution

### Cost Management
- AI model usage monitoring
- Storage optimization
- Database query optimization
- Worker execution optimization

## 🐛 Troubleshooting

### Common Issues

#### Worker Deployment Fails
```bash
# Check wrangler configuration
wrangler whoami
wrangler d1 list
wrangler r2 bucket list
wrangler vectorize list
```

#### Database Connection Issues
```bash
# Verify database exists
npm run db:list

# Check database binding in wrangler.toml
# Ensure database_id matches
```

#### Vector Search Not Working
```bash
# Verify Vectorize index
wrangler vectorize list

# Check index dimensions match embedding model
# Ensure lessons are properly uploaded
```

#### R2 Storage Issues
```bash
# Verify bucket exists
wrangler r2 bucket list

# Check bucket permissions
# Ensure content is properly formatted
```

### Debug Mode
```bash
# Enable debug logging
wrangler dev --log-level=debug

# Check worker logs
wrangler tail
```

## 📖 Documentation

- **RAG System**: `RAG_UPLOAD_INSTRUCTIONS.md`
- **API Reference**: See API endpoints section above
- **Database Schema**: `schema.sql`
- **Deployment**: `deploy-cloudflare.sh`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: This README and included guides
- **Cloudflare Support**: Official Cloudflare documentation
- **Community**: GitHub Discussions

## 🎉 Success!

Once deployed, your English learning app will have:

✅ **Complete RAG System** with 56 lessons  
✅ **AI-Powered Learning** with personalized recommendations  
✅ **Vector Search** for intelligent content retrieval  
✅ **Progress Tracking** with comprehensive analytics  
✅ **Cloudflare Infrastructure** for global performance  
✅ **Scalable Architecture** ready for growth  

**Happy Learning! 🎓✨**
