import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import articlesRoutes from './routes/articles.js';
import journalistArticlesRoutes from './routes/journalist-articles.js';
import commentsRoutes from './routes/comments.js';
import reactionsRoutes from './routes/reactions.js';
import statisticsRoutes from './routes/statistics.js';
import publicCommentsRoutes from './routes/public-comments.js';
import { authenticateToken } from './middleware/auth.js';
import './database/init.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for HTTPS - Allow all origins in development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Comments routes (protected - editor and journalist)
app.use('/api/comments', commentsRoutes);

// Reactions routes (public for viewing, protected for reacting)
app.use('/api/reactions', reactionsRoutes);

// Statistics routes (admin only)
app.use('/api/statistics', statisticsRoutes);

// Public comments routes (authenticated users)
app.use('/api/public-comments', publicCommentsRoutes);

// Journalist routes (protected)
app.use('/api/journalist', journalistArticlesRoutes);

// Articles routes (public and editor)
app.use('/api/articles', articlesRoutes);

// Protected route example (requires authentication)
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on https://localhost:${PORT}`);
  console.log(`Network access: https://10.94.233.226:${PORT}`);
  console.log('Using HTTPS with self-signed certificate');
});
