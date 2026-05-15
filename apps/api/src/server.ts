import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createServer } from 'http';
import { initSocketIO } from './lib/socket.js';
import healthRoutes from './routes/health.js';
import conversationRoutes from './routes/conversations.js';

const port = parseInt(process.env.API_PORT || '3001', 10);
const host = process.env.API_HOST || '0.0.0.0';

async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // CORS
  await fastify.register(cors, {
    origin: process.env.AUTH_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Routes
  await fastify.register(healthRoutes);
  await fastify.register(conversationRoutes);

  // Create HTTP server and attach Socket.IO
  await fastify.ready();
  const httpServer = createServer(fastify.server);
  initSocketIO(httpServer);

  httpServer.listen(port, host, () => {
    console.log(`[API] Server listening on http://${host}:${port}`);
    console.log(`[Socket.IO] WebSocket server ready`);
  });
}

start().catch((err) => {
  console.error('[API] Failed to start:', err);
  process.exit(1);
});
