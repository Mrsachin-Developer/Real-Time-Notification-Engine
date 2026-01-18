import dotenv from "dotenv";

// 🔥 LOAD ENV FIRST — BEFORE ALL OTHER IMPORTS
dotenv.config({
  path: [".env.local", ".env"],
});

import express from "express";
import connectDB from "./db/db.js";

import userRouter from "./routes/user.routes.js";
import pollRouter from "./routes/poll.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// 🔥 FIXED PATH (lowercase folder)
import { startWebSocketServer } from "../src/webSocket/socket.server.js";

const app = express();
app.use(express.json());

// Routes
app.use("/api/v1/polls", pollRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/v1/user", userRouter);

const port = process.env.PORT || 8000;

async function startServer() {
  console.log("ENV MONGODB_URI =", process.env.MONGODB_URI);

  // 1️⃣ Connect DB FIRST
  await connectDB();

  // 2️⃣ Start WebSocket
  startWebSocketServer(8081);

  // 3️⃣ Start background systems (DO NOT AWAIT)
  import("./worker/notification.worker.js");
  import("./schedulers/pollExpiryScheduler.js");

  // 4️⃣ Start API
  app.listen(port, () => {
    console.log(`Server is running at port: ${port} 🚀`);
  });
}

startServer();
