# TalentPilot Chat

A ChatGPT-like application for querying candidate CVs stored in a vector database.

## Overview

TalentPilot is an AI-powered recruitment platform that helps HR teams find the perfect candidates for their job openings. By leveraging vector embeddings and natural language processing, TalentPilot matches job descriptions with candidate profiles to identify the best fits.

## Key Features

- **AI-Powered Matching**: Uses OpenAI embeddings to convert job descriptions and CVs into vector representations for semantic matching
- **Real-time Chat Interface**: ChatGPT-like interface for describing job requirements and receiving candidate matches
- **Progress Tracking**: Real-time progress updates during the candidate search process
- **Smart Conversation Naming**: Automatically names conversations based on job titles
- **Conversation Completion**: Hides input after candidate delivery to indicate search completion
- **Vector Database**: Powered by TiDB Cloud for efficient vector similarity searches
- **Rich Candidate Profiles**: Detailed candidate information with match analysis and communication templates

## Project Structure

```
talent-pilot-chat/
├── client/              # Frontend React application
│   ├── public/          # Public assets
│   ├── src/             # Client source code
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service calls
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── App.js       # Main application component
│   │   └── index.js     # Entry point
│   ├── package.json     # Client dependencies
│   └── README.md        # Client documentation
│
└── server/              # Backend Node.js application
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

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- TiDB Cloud account
- OpenAI API key

## Setup

1. Install dependencies for both client and server:
   ```bash
   # From the talent-pilot-chat directory
   cd server && npm install
   cd ../client && npm install
   ```

   Or use the root script:
   ```bash
   # From the root directory (TiDB/TalentPilot)
   npm run install:all
   ```

2. Configure environment variables in `talent-pilot-chat/server/.env`:
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

4. Run the development servers:
   ```bash
   # From the talent-pilot-chat directory
   
   # Start backend server
   cd server && npm run dev
   
   # In a separate terminal, start frontend
   cd ../client && npm start
   ```

5. Or run both concurrently:
   ```bash
   # From the root directory (TiDB/TalentPilot)
   npm run dev:full
   ```

## API Documentation

See [talent-pilot-chat/server/API.md](talent-pilot-chat/server/API.md) for detailed API documentation with examples.

## Recent Enhancements

- **Progress Tracking**: Real-time progress updates showing the current step in the candidate search process
- **Smart Conversation Naming**: Conversations are automatically named based on job titles after the first response
- **Conversation Completion**: Input is hidden after candidate delivery to indicate the search is complete
- **Enhanced UI**: Visual progress indicators and improved user experience

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- TiDB Cloud for vector database capabilities
- OpenAI for embeddings and natural language processing
- React and Node.js communities for excellent development tools