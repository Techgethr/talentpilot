# TalentPilot Chat

A ChatGPT-like application for querying candidate CVs stored in a vector database.

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
├── config/          # Configuration files
├── utils/           # Utility functions
└── server.js        # Main application entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=3000
   # TiDB Cloud connection settings
   TIDB_HOST=your-tidb-cluster-host
   TIDB_PORT=4000
   TIDB_USER=your-username
   TIDB_PASSWORD=your-password
   TIDB_DATABASE=talentpilot
   TIDB_SSL=true
   # API keys for NLP services
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Set up TiDB Cloud:
   - Create a TiDB Cloud cluster
   - Obtain connection details (host, port, username, password)
   - Update the `.env` file with your TiDB Cloud credentials
   - The application will automatically create the required tables on first run

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Or run the production server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /` - Health check endpoint
- `GET /health` - Detailed health check
- `POST /api/chat` - Send a job description to get matching candidates
- `POST /api/candidates/upload` - Upload and process a candidate CV
- `GET /api/candidates/:id` - Get candidate by ID
- `POST /api/jobs` - Create a new job posting
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/:id/candidates` - Search candidates for a specific job
- `POST /api/users` - Create a new user (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `POST /api/feedback` - Submit feedback on candidate matches
- `GET /api/feedback/:jobId` - Get feedback for a specific job

## API Documentation

See [API.md](API.md) for detailed API documentation with examples.

## Services

- **chatService** - Main service for processing chat messages
- **nlpService** - Natural language processing for extracting requirements
- **tidbService** - Interface with TiDB Cloud for data storage and vector search
- **candidateController** - Handle candidate-related requests
- **jobController** - Handle job posting-related requests

## Database Schema

The application uses the following tables in TiDB:

1. **candidates** - Stores candidate information and CV vectors
2. **jobs** - Stores job postings and requirement vectors
3. **conversations** - Stores chat conversations for analytics
4. **users** - Stores user information for authentication
5. **feedback** - Stores feedback on candidate matches

## Development

This project uses:
- Node.js with Express for the backend
- Nodemon for development server with hot reloading
- Dotenv for environment variable management
- mysql2 for TiDB Cloud connectivity

## TiDB Cloud Features Used

- Vector data type for storing and searching CV embeddings
- JSON data type for flexible storage of skills and requirements
- Horizontal scaling capabilities for handling large datasets
- Built-in security features for data protection