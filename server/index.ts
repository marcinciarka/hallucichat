import { createServer } from 'http';
import { Server } from 'socket.io';
import { transformMessage, transformNickname } from './lib/gemini';
import { PromptStyle } from './lib/prompts';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const SOCKET_PORT = dev ? 3001 : (process.env.PORT || 3000);

interface User {
  id: string;
  nickname: string;
  originalNickname: string;
  style: PromptStyle;
}

interface Message {
  id: string;
  user: User;
  content: string;
  originalContent: string;
  timestamp: Date;
}

// Create standalone Socket.IO server
const server = createServer();

const io = new Server(server, {
  cors: {
    origin: dev ? "http://localhost:3000" : false,
    methods: ["GET", "POST"]
  }
});

const users = new Map<string, User>();
const messages: Message[] = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining with nickname
  socket.on('join', async (data: { nickname: string; style: PromptStyle }) => {
    try {
      const { nickname: originalNickname, style } = data;

      // Transform nickname using Gemini with the selected style
      const transformedNickname = await transformNickname(originalNickname, style);

      const user: User = {
        id: socket.id,
        nickname: transformedNickname,
        originalNickname,
        style
      };

      users.set(socket.id, user);

      // Send current users and messages to the new user
      socket.emit('user-joined', user);
      socket.emit('users-list', Array.from(users.values()));
      socket.emit('messages-history', messages);

      // Broadcast to others that a new user joined
      socket.broadcast.emit('user-joined', user);
      socket.broadcast.emit('users-list', Array.from(users.values()));

      console.log(`User ${originalNickname} joined as ${transformedNickname}`);
    } catch (error) {
      console.error('Error transforming nickname:', error);
      socket.emit('error', 'Failed to join chat');
    }
  });

  // Handle sending messages
  socket.on('send-message', async (originalContent: string) => {
    const user = users.get(socket.id);
    if (!user) {
      socket.emit('error', 'User not found');
      return;
    }

    try {
      // Transform message using Gemini with the user's style
      const transformedContent = await transformMessage(originalContent, user.style);

      const message: Message = {
        id: `${Date.now()}-${socket.id}`,
        user,
        content: transformedContent,
        originalContent,
        timestamp: new Date()
      };

      messages.push(message);

      // Keep only last 100 messages
      if (messages.length > 100) {
        messages.shift();
      }

      // Broadcast message to all users
      io.emit('new-message', message);

      console.log(`Message from ${user.nickname}: ${transformedContent}`);
    } catch (error) {
      console.error('Error transforming message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      socket.broadcast.emit('user-left', user);
      socket.broadcast.emit('users-list', Array.from(users.values()));
      console.log(`User ${user.nickname} disconnected`);
    }
  });
});

server.listen(SOCKET_PORT, () => {
  console.log(`> Socket.IO server ready on http://localhost:${SOCKET_PORT}`);
});