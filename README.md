# TalentPilot Chat

A ChatGPT-like application for querying candidate CVs stored in a vector database.

## Overview

TalentPilot is an AI-powered recruitment platform that helps HR teams find the perfect candidates for their job openings. By leveraging vector embeddings and natural language processing, TalentPilot matches job descriptions with candidate profiles to identify the best fits.

## Key Features

- **AI-Powered Matching**: Uses embeddings to convert job descriptions and CVs into vector representations for semantic matching
- **Real-time Chat Interface**: ChatGPT-like interface for describing job requirements and receiving candidate matches
- **Progress Tracking**: Real-time progress updates during the candidate search process
- **Smart Conversation Naming**: Automatically names conversations based on job titles
- **Conversation Completion**: Hides input after candidate delivery to indicate search completion
- **Similarity candidate search**: Uses vector similarity search to find similar candidates from the database
- **Vector Database**: Powered by TiDB Cloud for efficient vector similarity searches
- **Rich Candidate Profiles**: Detailed candidate information with match analysis and communication templates

## Use Cases

TalentPilot Chat is designed for several key use cases in modern recruitment:

1. **Rapid Candidate Sourcing**: Quickly find qualified candidates by describing job requirements in natural language, eliminating the need for complex Boolean search strings.

2. **Skills-Based Matching**: Go beyond keyword matching to find candidates with relevant skills and experiences, even if they don't use identical terminology in their CVs.

3. **Passive Candidate Engagement**: Identify and reach out to passive candidates who match specific role requirements but haven't applied directly.

4. **Talent Pipeline Building**: Create talent pools for future hiring needs by describing ideal candidate profiles and storing matches for later outreach.

5. **Role Analysis and Optimization**: Analyze existing job postings against your candidate database to identify potential improvements or gaps in role requirements.

6. **Competitive Intelligence**: Understand the talent landscape for specific roles by analyzing candidate availability and qualifications.

## Who Benefits

TalentPilot Chat provides value to multiple stakeholders in the recruitment process:

1. **HR Recruiters**: Save time by quickly finding qualified candidates without manual CV screening.
2. **Hiring Managers**: Get immediate access to relevant candidates when defining new roles.
3. **Talent Acquisition Teams**: Improve efficiency and quality of hire through better candidate matching.
4. **Startups and Small Businesses**: Access enterprise-level candidate matching capabilities without dedicated recruitment teams.
5. **Executive Recruiters**: Find high-level candidates with specific skill combinations and experience patterns.
6. **University Career Centers**: Help students and alumni find job opportunities that match their qualifications.

## Benefits of TiDB Cloud and Vector-Based Search

TalentPilot leverages TiDB Cloud and vector-based data search to deliver superior recruitment capabilities:

### TiDB Cloud Benefits:
1. **Horizontal Scalability**: Seamlessly handle growing CV databases and increasing user loads without performance degradation.
2. **High Availability**: Enterprise-grade uptime ensures consistent access to candidate matching capabilities.
3. **Managed Infrastructure**: Focus on recruitment rather than database administration with fully managed database services.
4. **MySQL Compatibility**: Leverage existing SQL knowledge and tools for data analysis and reporting.
5. **Global Distribution**: Deploy closer to users for reduced latency and improved user experience.
6. **Security and Compliance**: Built-in data encryption and compliance features to protect sensitive candidate information.

### Vector-Based Search Benefits:
1. **Semantic Understanding**: Match candidates based on meaning and context rather than exact keyword matches.
2. **Improved Relevance**: Find candidates with relevant skills even if they describe them differently than your job posting.
3. **Fuzzy Matching**: Handle variations in terminology, abbreviations, and phrasing across CVs and job descriptions.
4. **Multilingual Support**: Process CVs and job descriptions in multiple languages with consistent matching quality.
5. **Continuous Learning**: Refine matching accuracy over time as more data is processed and feedback is incorporated.
6. **Complex Pattern Recognition**: Identify subtle patterns in experience and skills that traditional search methods would miss.

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
- OpenAI API key (or any other OpenAI SDK compatible service, like Kimi/Moonshot)

## Setup

1. Install dependencies for both client and server:
   ```bash
   # From the talent-pilot-chat directory
   cd server && npm install
   cd ../client && npm install
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
   OPENAI_API_BASE_URL=your_openai_api_base_url (default: https://api.openai.com/v1)
   OPENAI_MODEL=your_openai_model (default: gpt-4o-mini)
   OPENAI_EMBEDDING_MODEL=your_openai_embedding_model (default: text-embedding-3-small)
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

## API Documentation

See [talent-pilot-chat/server/API.md](talent-pilot-chat/server/API.md) for detailed API documentation with examples.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.