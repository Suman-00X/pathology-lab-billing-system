import jwt from 'jsonwebtoken';
import Client from '../models/Client.js';

// Generate JWT token
const generateToken = (clientId) => {
  return jwt.sign({ clientId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '30d'
  });
};

// Middleware to authenticate client and add clientId to request
const authenticateClient = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const client = await Client.findById(decoded.clientId);
    
    if (!client || !client.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive client.' });
    }

    // Add client info to request
    req.clientId = client._id;
    req.client = client;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Middleware to inject clientId into query/body for data isolation
const injectClientId = (req, res, next) => {
  if (req.clientId) {
    // For GET requests, add to query filter
    if (req.method === 'GET') {
      req.query.clientId = req.clientId;
    }
    
    // For POST/PUT/PATCH requests, add to body
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.body.clientId = req.clientId;
    }
  }
  next();
};

// Verify secret pin for sensitive operations
const verifySecretPin = async (req, res, next) => {
  try {
    const { secretPin } = req.body;
    
    if (!secretPin) {
      return res.status(400).json({ message: 'Secret PIN is required for this operation.' });
    }

    if (!req.client) {
      return res.status(401).json({ message: 'Client authentication required.' });
    }

    const isValidPin = await req.client.compareSecretPin(secretPin);
    if (!isValidPin) {
      return res.status(403).json({ message: 'Invalid secret PIN.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying secret PIN', error: error.message });
  }
};

export {
  generateToken,
  authenticateClient,
  injectClientId,
  verifySecretPin
};
