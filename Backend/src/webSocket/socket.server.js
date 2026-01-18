// import { webSocketServer } from "ws";

// const wws = webSocketServer({ port: 8081 });
// const clients = new Map(); // Map --> key, value pair it stores the connected users "userId → WebSocket connection"

// console.log("⚡ WebSocket running on ws://localhost:8081");

// // 1️⃣ User Connects to Server
// wws.on("connection", (socket) => {
//   // When this user sends me a message, run this function. socket.on()means”
//   // 2️⃣ User Sends Their Identity
//   socket.on("message", (msg) => {
//     // 3️⃣ Extract User ID
//     const { userId } = JSON.parse(msg);
//     // 4️⃣ Register User as Online
//     clients.set(userId, socket);
//     console.log("User connected:", userId);
//   });

//   //   6️⃣ User Leaves
//   socket.on("close", () => {
//     // 7️⃣ Find Who Left
//     for (const [key, value] of clients.entries()) {
//       if (value === socket) clients.delete(key);
//     }
//   });
// });

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8081 });
const clients = new Map();

console.log("⚡ WebSocket running on ws://localhost:8081");

wss.on("connection", (socket) => {
  socket.on("message", (msg) => {
    const { userId } = JSON.parse(msg);
    clients.set(userId, socket);
    console.log("User connected:", userId);
  });

  socket.on("close", () => {
    for (const [key, value] of clients.entries()) {
      if (value === socket) clients.delete(key);
    }
  });
});

export function pushToUser(userId, payload) {
  const socket = clients.get(userId.toString());
  if (socket) {
    socket.send(JSON.stringify(payload));
  }
}
