import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import routes from './routes';
import { initializeSocket } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Initialize Socket.IO
initializeSocket(httpServer);

// Start server - bind to 0.0.0.0 to accept connections from network
httpServer.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket ready for connections`);
});
