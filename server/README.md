# TalentPilot Chat Server

The backend server for the TalentPilot Chat application.

## Project Structure

```
server/
├── src/             # Server source code
│   ├── controllers/ # Request handlers
│   ├── middleware/  # Custom middleware
│   ├── models/      # Data models
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   ├── config/      # Configuration files
│   ├── utils/       # Utility functions
│   └── server.js    # Main application entry point
├── test/            # Server tests
├── package.json     # Server dependencies
└── .env             # Environment variables
```

## Key Features

- **AI Agent Coordination**: Orchestrates multiple AI agents for job analysis, candidate search, and profile enhancement
- **Vector Database Integration**: Uses TiDB Cloud for efficient vector similarity searches
- **Natural Language Processing**: Processes job descriptions and CVs using OpenAI embeddings
- **Conversation Management**: Handles conversation creation, message storage, and title updates
- **RESTful API**: Provides endpoints for chat, candidates, jobs, users, and feedback

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
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/:id` - Get conversation by ID
- `PUT /api/conversations/:id/title` - Update conversation title
- `POST /api/conversations/message` - Send message in conversation
- `DELETE /api/conversations/:id` - Delete conversation

## API Documentation

See [API.md](API.md) for detailed API documentation with examples.

## Services

- **chatService** - Main service for processing chat messages
- **nlpService** - Natural language processing for extracting requirements
- **tidbService** - Interface with TiDB Cloud for data storage and vector search
- **candidateController** - Handle candidate-related requests
- **jobController** - Handle job posting-related requests
- **agentCoordinator** - Orchestrate multiple AI agents for processing job descriptions
- **embeddingService** - Generate vector embeddings using OpenAI

## Database Schema

The application uses the following tables in TiDB:

1. **candidates** - Stores candidate information and CV vectors
2. **jobs** - Stores job postings and requirement vectors
3. **conversations** - Stores chat conversations for analytics
4. **messages** - Stores individual messages within conversations
5. **users** - Stores user information for authentication
6. **feedback** - Stores feedback on candidate matches

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

## Recent Enhancements

### Smart Conversation Naming
- Conversations are automatically renamed based on job titles after the first response
- The `sendMessage` endpoint now includes logic to update conversation titles

### Conversation Completion Flag
- API responses now include a `candidatesDelivered` flag to indicate when candidates have been delivered
- This allows the frontend to hide the input field after candidate delivery

### Enhanced Agent Coordination
- Improved progress reporting in the agent coordinator
- More detailed progress updates for better user experience

### New Conversation Title Endpoint
- Added PUT `/api/conversations/:id/title` endpoint for updating conversation titles
- Supports dynamic conversation naming based on user actions

## Testing

Run server tests with:
```bash
npm test
```

## Deployment

For production deployment:
```bash
npm start
```

The server will start on the port specified in the `.env` file (default: 3000).