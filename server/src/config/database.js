// src/config/database.js
// Configuration for vector database connection

const config = {
  vectorDb: {
    url: process.env.VECTOR_DB_URL || 'http://localhost:2379',
    // Add other database configuration options here
  }
};

module.exports = config;