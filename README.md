# TalentPilot Chat

A ChatGPT-like application for querying candidate CVs stored in a vector database.

## Project Structure

```
src/
├── controllers/     # Request handlers
├── models/         # Data models
├── routes/         # API routes
├── services/       # Business logic
├── config/         # Configuration files
├── utils/          # Utility functions
└── server.js       # Main application entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=3000
   VECTOR_DB_URL=your_vector_database_url
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Or run the production server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/chat` - Send a job description to get matching candidates

## Services

- **chatService** - Main service for processing chat messages
- **nlpService** - Natural language processing for extracting requirements
- **vectorDbService** - Interface with vector database for candidate search

## Development

This project uses:
- Node.js with Express for the backend
- Nodemon for development server with hot reloading
- Dotenv for environment variable management