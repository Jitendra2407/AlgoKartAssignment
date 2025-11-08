# TCP Chat Server

A simple, real-time TCP-based chat server built with Node.js that allows multiple users to connect and communicate with each other through a command-line interface.

## Features

- **User Authentication**: Login with a unique username
- **Public Broadcasting**: Send messages to all connected users
- **Direct Messaging**: Send private messages to specific users
- **User Discovery**: See who's currently online
- **Connection Management**: Automatic notification when users join/leave
- **Health Check**: PING/PONG functionality to test connection

## Prerequisites

- Node.js (version 12 or higher)
- A TCP client like `nc` (netcat) or `telnet`

## Installation

1. Clone or download the project files
2. Navigate to the project directory
3. No additional dependencies required - uses Node.js built-in modules only

```bash
cd tcp-chat-server
```

## Running the Server

### Default Port (4000)

```bash
node server.js
```

### Custom Port

```bash
PORT=5000 node server.js
```

The server will start and display:
```
[SERVER] TCP chat server listening on port 4000
```

## Connecting to the Server

You can connect using various TCP clients:

### Using netcat (nc)

```bash
nc localhost 4000
```

### Using telnet

```bash
telnet localhost 4000
```

### Using a different port

```bash
nc localhost 5000
```

## Commands

Once connected, you must first login before using other commands.

### LOGIN - Authenticate with a username

```
LOGIN <username>
```

**Rules:**
- Username must not contain spaces
- Username must be unique (not already taken)
- Required before using any other commands

**Response:**
- `OK` - Login successful
- `ERR invalid-username` - Username contains spaces or is empty
- `ERR username-taken` - Username already in use (connection will close)

### MSG - Send a message to all users

```
MSG <text>
```

Broadcasts your message to all connected users including yourself.

**Example:**
```
MSG Hello everyone!
```

### DM - Send a direct message

```
DM <username> <text>
```

Sends a private message to a specific user.

**Response:**
- `DM-SENT <username> <text>` - Message delivered successfully
- `ERR user-not-found <username>` - Target user not found

**Example:**
```
DM Alice Hey, how are you?
```

### WHO - List connected users

```
WHO
```

Displays all currently logged-in users.

**Response:**
```
--- Connected Users ---
USER Alice
USER Bob
USER Charlie
-----------------------
```

### PING - Check connection

```
PING
```

Tests if the server is responding.

**Response:**
```
PONG
```

## Example Chat Session

Below is an example showing two users (Alice and Bob) connecting and chatting:

### Terminal 1 - Alice

```
$ nc localhost 4000
LOGIN Alice
OK
INFO Bob joined the chat
MSG Hi Bob! Welcome to the chat!
MSG Alice Hi Bob! Welcome to the chat!
MSG Bob Hey Alice! Thanks! How are you?
DM Bob I'm doing great, thanks for asking!
DM-SENT Bob I'm doing great, thanks for asking!
MSG Bob That's awesome! Want to grab coffee later?
WHO
--- Connected Users ---
USER Alice
USER Bob
-----------------------
PING
PONG
MSG See you later Bob!
MSG Alice See you later Bob!
MSG Bob Bye Alice!
INFO Bob disconnected
```

### Terminal 2 - Bob

```
$ nc localhost 4000
LOGIN Bob
OK
INFO Alice joined the chat
MSG Alice Hi Bob! Welcome to the chat!
MSG Hey Alice! Thanks! How are you?
MSG Bob Hey Alice! Thanks! How are you?
DM Alice I'm doing great, thanks for asking!
MSG That's awesome! Want to grab coffee later?
MSG Bob That's awesome! Want to grab coffee later?
MSG Alice See you later Bob!
MSG Bye Alice!
MSG Bob Bye Alice!
^C
```

## Server Messages

The server sends various informational messages:

### INFO Messages

Automatic notifications about user activity:
- `INFO <username> joined the chat` - When a user logs in
- `INFO <username> disconnected` - When a user disconnects

### MSG Messages

Public messages from users:
- `MSG <username> <text>` - Broadcast message from a user

### DM Messages

Direct messages between users:
- `DM <username> <text>` - Private message from a user (received by target)
- `DM-SENT <username> <text>` - Confirmation that your DM was sent (received by sender)

### Error Messages

- `ERR invalid-username` - Username validation failed
- `ERR username-taken` - Username already in use
- `ERR not-logged-in (send LOGIN <username>)` - Command sent before logging in
- `ERR user-not-found <username>` - DM target user doesn't exist
- `ERR usage: DM <username> <text>` - Invalid DM command format
- `ERR unknown-command (use: MSG, WHO, PING, DM)` - Invalid command

## Server Logs

The server displays logs in the console:

```
[SERVER] TCP chat server listening on port 4000
[SERVER] New client connected: ::ffff:127.0.0.1:54321
[SERVER] User Alice logged in from ::ffff:127.0.0.1:54321
[Alice] sent: MSG Hello everyone!
[CHAT] Alice: Hello everyone!
[SERVER] User Alice logged out.
[SERVER] Client disconnected: ::ffff:127.0.0.1:54321
```

## Technical Details

- **Protocol**: TCP
- **Default Port**: 4000 (configurable via PORT environment variable)
- **Message Format**: Text-based, newline-delimited commands
- **Connection Type**: Persistent (stays open until client disconnects)
- **Buffer Management**: Handles partial messages and multiple commands in one packet

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE` error:
1. Check if another instance is running
2. Use a different port: `PORT=5001 node server.js`

### Connection Refused

- Ensure the server is running
- Check firewall settings
- Verify you're using the correct port

### Commands Not Working

- Ensure you've logged in first with `LOGIN <username>`
- Check command syntax (commands are case-sensitive)
- Verify your client sends newline characters after each command

## Stopping the Server

Press `Ctrl+C` in the terminal running the server to shut it down gracefully.

## License

This project is provided as-is for educational purposes.