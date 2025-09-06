/**
 * @file This file contains the setup for the Socket.IO server.
 * @exports setupSocket
 */

import { Server } from 'socket.io';

/**
 * Sets up the Socket.IO server.
 * @param {Server} io - The Socket.IO server instance.
 */
export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    /**
     * Handles incoming messages from clients.
     * @param {object} msg - The message object.
     * @param {string} msg.text - The text of the message.
     * @param {string} msg.senderId - The ID of the sender.
     */
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Handles client disconnections.
     */
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};