import { WebSocketServer } from "ws";

const clients = new Map();
let wss;

export function startWebSocketServer(port = 8081) {
  if (wss) return wss; // 🔥 prevents double-start

  wss = new WebSocketServer({ port });
  console.log(`⚡ WebSocket running on ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    ws.on("message", (msg) => {
      try {
        const { userId } = JSON.parse(msg.toString());
        if (userId) {
          clients.set(userId, ws);
        }
      } catch {}
    });

    ws.on("close", () => {
      for (const [key, value] of clients.entries()) {
        if (value === ws) {
          clients.delete(key);
          break;
        }
      }
    });
  });

  return wss;
}

export function pushToUser(userId, data) {
  const socket = clients.get(userId?.toString());
  if (socket) {
    socket.send(JSON.stringify(data));
  }
}
