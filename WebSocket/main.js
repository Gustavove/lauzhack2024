const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

let connectedClients = {};

wss.on('connection', (ws, req) => {
    const clientId = req.connection.remoteAddress;

    connectedClients[clientId] = ws;
    console.log(`New client with id: ${clientId}`);

    ws.on('message', (message) => {
        console.log(`Message ${clientId}: ${message}`);

        for (let id in connectedClients) {
            if (id !== clientId) {
                connectedClients[id].send(message);
            }
        }
    });

    ws.on('close', () => {
        delete connectedClients[clientId];
        console.log(`Disconnected client: ${clientId}`);
    });

    ws.on('error', (error) => {
        console.error(`Error with the client ${clientId}: ${error}`);
        delete connectedClients[clientId];
    });
});

console.log('WebSocket server is running at ws://localhost:3001');