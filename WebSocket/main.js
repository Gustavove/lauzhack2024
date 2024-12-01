const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 3001 });

let connectedClients = {};

wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    connectedClients[clientId] = ws;
    console.log(`New client connected with id: ${clientId}`);

    ws.on('message', (message) => {
        console.log(`Message from ${clientId}: ${message}`);

        for (let id in connectedClients) {
            if (id !== clientId) {
                try {
                    connectedClients[id].send(message);
                } catch (error) {
                    console.error(`Error sending message to client ${id}: ${error}`);
                }
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