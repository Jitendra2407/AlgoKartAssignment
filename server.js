// server.js
const net = require('net');

const users = new Map();

/**
 * Sends a message to every connected and logged-in user.
 * @param {string} message The message to broadcast.
 */
function broadcast(message) {
  for (const userSocket of users.values()) {
    userSocket.write(message + '\n');
  }
}

const server = net.createServer();

server.on('connection', (socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[SERVER] New client connected: ${clientAddress}`);

  let dataBuffer = '';
  socket.isLoggedIn = false;
  socket.username = null;

  socket.on('data', (data) => {
    dataBuffer += data.toString();

    let newlineIndex;
    while ((newlineIndex = dataBuffer.indexOf('\n')) !== -1) {
      const rawCommand = dataBuffer.substring(0, newlineIndex);
      // We trim *after* extracting, so 'MSG ' with spaces isn't trimmed
      const command = rawCommand.trim();
      dataBuffer = dataBuffer.substring(newlineIndex + 1);

      if (!command) continue;

      console.log(`[${socket.username || clientAddress}] sent: ${command}`);

      if (!socket.isLoggedIn) {
        // --- Login Flow (Sprints 7, 8, 9) ---
        if (command.startsWith('LOGIN ')) {
          const username = command.substring(6).trim();

          if (!username || username.includes(' ') || username.length === 0) {
            socket.write('ERR invalid-username\n');
            continue;
          }

          if (users.has(username)) {
            socket.write('ERR username-taken\n');
            socket.end();
          } else {
            socket.isLoggedIn = true;
            socket.username = username;
            users.set(username, socket);

            socket.write('OK\n');
            console.log(`[SERVER] User ${username} logged in from ${clientAddress}`);

            // Notify others
            for (const userSocket of users.values()) {
              if (userSocket !== socket) {
                userSocket.write(`INFO ${username} joined the chat\n`);
              }
            }
          }
        } else {
          socket.write('ERR not-logged-in (send LOGIN <username>)\n');
        }
      } else {
        // --- User is logged in, process other commands ---

        // --- Sprints 13 & 14: MSG Command ---
        // We use startsWith on the rawCommand to preserve spaces
        if (rawCommand.startsWith('MSG ')) {
          const text = rawCommand.substring(4).trim(); // trim only the text

          if (text) {
            const broadcastMessage = `MSG ${socket.username} ${text}`;
            broadcast(broadcastMessage);
            console.log(`[CHAT] ${socket.username}: ${text}`);
          }

        // --- Sprint 15: (Bonus) WHO Command ---
        } else if (command === 'WHO') {
          socket.write('--- Connected Users ---\n');
          for (const username of users.keys()) {
            socket.write(`USER ${username}\n`);
          }
          socket.write('-----------------------\n');

        // --- Sprint 16: (Bonus) PING Command ---
        } else if (command === 'PING') {
          socket.write('PONG\n');

        // --- Sprint 17: (Bonus) DM Command ---
        } else if (command.startsWith('DM ')) {
          const parts = command.split(' ');
          const targetUsername = parts[1];
          const text = parts.slice(2).join(' '); // Re-join the rest as the message

          if (!targetUsername || !text) {
            socket.write('ERR usage: DM <username> <text>\n');
            continue;
          }

          const targetSocket = users.get(targetUsername);

          if (targetSocket) {
            // Send to target user
            targetSocket.write(`DM ${socket.username} ${text}\n`);
            // Send confirmation to sender
            socket.write(`DM-SENT ${targetUsername} ${text}\n`);
          } else {
            // Target user not found
            socket.write(`ERR user-not-found ${targetUsername}\n`);
          }

        } else {
          // Handle unknown commands
          socket.write('ERR unknown-command (use: MSG, WHO, PING, DM)\n');
        }
      }
    }
  });

  // --- Sprints 10 & 12: Handle Client Disconnects ---
  socket.on('close', () => {
    console.log(`[SERVER] Client disconnected: ${clientAddress}`);

    if (socket.isLoggedIn && socket.username) {
      users.delete(socket.username);
      console.log(`[SERVER] User ${socket.username} logged out.`);
      broadcast(`INFO ${socket.username} disconnected`);
    }
  });

  socket.on('error', (err) => {
    console.log(`[SERVER] Socket error from ${clientAddress}: ${err.message}`);
  });
});

// --- Sprint 18: Make Port Configurable ---
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`[SERVER] TCP chat server listening on port ${PORT}`);
});