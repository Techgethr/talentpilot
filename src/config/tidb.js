// src/config/tidb.js
// Configuration for TiDB Cloud connection

const config = {
  tidb: {
    host: process.env.TIDB_HOST || 'localhost',
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'talentpilot',
    ssl: process.env.TIDB_SSL === 'true' || false
  }
};

module.exports = config;