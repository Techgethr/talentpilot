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
- **Conversation Completion**: Input is hidden after candidate delivery to indicate search completion
- **Responsive Design**: Works on desktop and mobile devices

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

## Recent Enhancements

### Progress Tracking
- Real-time progress updates showing the current step in the candidate search process
- Visual progress bar with 5 distinct steps:
  1. Analyze requirements
  2. Search candidates
  3. Generate profiles
  4. Create templates
  5. Final summary
- Each step is highlighted as it becomes active

### Smart Conversation Naming
- Conversations are automatically renamed based on job titles after the first response
- Provides better organization and context for users

### Conversation Completion
- Input field is hidden after candidate delivery to indicate the search is complete
- Shows a completion message to inform users that the process is finished

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).