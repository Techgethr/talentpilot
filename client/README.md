# TalentPilot Frontend

This is the React frontend for the TalentPilot Chat application.

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Page components
├── services/        # API service calls
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── App.js           # Main application component
└── index.js         # Entry point
```

## Key Features

- **Chat Interface**: ChatGPT-like interface for interacting with the AI recruitment assistant
- **Conversation Management**: Create, view, and delete conversations
- **Real-time Progress Tracking**: Visual indicators showing the current step in the candidate search process
- **Smart Conversation Naming**: Conversations automatically named based on job titles
- **Similarity Candidate Search**: Uses vector similarity search to find similar candidates from the database
- **Conversation Termination**: Conversations are automatically terminated after candidate delivery to prevent further input
- **Responsive Design**: Works on desktop and mobile devices

## Use Cases

TalentPilot Frontend supports several key recruitment workflows:

1. **Interactive Candidate Search**: HR professionals can describe job requirements in natural language and receive real-time candidate matches.

2. **Collaborative Hiring**: Multiple team members can review candidate matches and provide feedback through the platform.

3. **Talent Pipeline Management**: Build and maintain talent pools for current and future hiring needs.

4. **Interview Scheduling**: Access candidate profiles with pre-generated communication templates to streamline outreach.

5. **Hiring Analytics**: Track conversation patterns and candidate matches to improve recruitment strategies.

## Benefits of the Frontend Interface

The TalentPilot Frontend provides several advantages for recruitment teams:

1. **Intuitive User Experience**: Familiar ChatGPT-like interface reduces learning curve for new users.

2. **Real-time Feedback**: Instant progress updates keep users informed throughout the candidate search process.

3. **Mobile Responsiveness**: Access candidate matches and manage conversations from any device.

4. **Visual Progress Tracking**: Clear indicators show users where they are in the candidate matching process.

5. **Smart Organization**: Automatic conversation naming and termination help keep the interface clean and organized.

6. **Seamless Integration**: Direct connection to the backend services powered by TiDB Cloud vector search.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on http://localhost:3000 (same as the backend due to proxy configuration).

## Development

This project uses:
- React with functional components and hooks
- React Router for navigation
- Axios for API calls
- CSS modules for styling

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.
