// src/middleware/logger.js
// Middleware for logging requests

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Log response when it's finished
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.timestamp;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - Status: ${res.statusCode} - Time: ${responseTime}ms`);
    originalSend.call(this, data);
  };
  
  req.timestamp = Date.now();
  next();
}

module.exports = requestLogger;