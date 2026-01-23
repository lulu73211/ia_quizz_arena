import { Router } from 'express';

const router = Router();

// Room routes are primarily handled via WebSocket
// This REST endpoint is for getting room info without a socket connection

router.get('/info/:code', (req, res) => {
  // Room info is managed in memory via socket.ts
  // This endpoint returns a simple confirmation that the room system is active
  res.json({ 
    message: 'Room system active. Use WebSocket to interact with rooms.',
    code: req.params.code 
  });
});

export default router;
