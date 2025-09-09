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

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).