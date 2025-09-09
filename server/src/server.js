const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatRoutes = require('./routes/chatRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const tidbService = require('./services/tidbService');
const requestLogger = require('./middleware/logger');
const { authenticate } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Public routes
app.use('/api/chat', chatRoutes);

// Protected routes
app.use('/api/candidates', authenticate, candidateRoutes);
app.use('/api/jobs', authenticate, jobRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/feedback', authenticate, feedbackRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'TalentPilot Chat API is running!' });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await tidbService.executeQuery('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected', error: error.message });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await tidbService.initialize();
    
    // Create tables if they don't exist
    await tidbService.createTables();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();