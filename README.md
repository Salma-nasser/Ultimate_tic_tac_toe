# Ultimate Tic-Tac-Toe

A modern, neon-styled Ultimate Tic-Tac-Toe game with local, AI, and online multiplayer modes.

## Features
- **Neon Cyberpunk Theme**: Engaging visuals with ambient lighting.
- **Game Logic**: Full implementation of Ultimate Tic-Tac-Toe rules.
- **AI Opponent**: Play against a heuristic-based AI.
- **Online Multiplayer**: Create rooms and play with friends over local network or internet (requires port forwarding/tunneling).
- **Local Multiplayer**: Pass and play on the same device.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Development Mode**
   Open two terminals:
   
   Terminal 1 (Frontend):
   ```bash
   npm run dev
   ```
   
   Terminal 2 (Backend for Multiplayer):
   ```bash
   npm run server
   ```

3. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Technologies
- React + Vite
- Socket.io (Real-time communication)
- Express (Server)
- CSS3 (Animations & Variables)
