// server.js
const net = require('net');

const server = net.createServer();

server.on('connection', (socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[SERVER] New client connected: ${clientAddress}`);

  // --- SOLUTION: Add a buffer for this specific client ---
  let dataBuffer = '';

  socket.on('data', (data) => {
    // Add the new chunk of data to our buffer
    dataBuffer += data.toString();

    // Check if the buffer contains a newline character (\n)
    let newlineIndex;
    
    // Keep processing commands as long as we find newlines
    // This handles the case where multiple commands are sent at once
    while ((newlineIndex = dataBuffer.indexOf('\n')) !== -1) {
      
      // Extract the complete command (everything before the \n)
      const command = dataBuffer.substring(0, newlineIndex).trim();
      
      // Remove the processed command (and the \n) from the buffer
      dataBuffer = dataBuffer.substring(newlineIndex + 1);

      // Only process if the command is not just an empty string
      if (command) {
        console.log(`[CLIENT ${clientAddress}] sent command: ${command}`);
        
        // --- This is where your logic for Sprints 7-17 will go ---
        // Example:
        // if (command.startsWith('LOGIN')) {
        //   // Do login logic
        // } else if (command.startsWith('MSG')) {
        //   // Do message logic
        // }
      }
    }
  });

  socket.on('close', () => {
    console.log(`[SERVER] Client disconnected: ${clientAddress}`);
  });

  socket.on('error', (err) => {
    console.log(`[SERVER] Socket error from ${clientAddress}: ${err.message}`);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`[SERVER] TCP chat server listening on port ${PORT}`);
});