import express from "express";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import pollRouter from "./routes/poll.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config({
  path: [".env.local", ".env"],
});
const app = express();
app.use(express.json());

// Routes
app.use("/api/v1/polls", pollRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/v1/user", userRouter);

const port = process.env.PORT || 8000;

connectDB();

app.listen(port, () => {
  console.log(`Server is running at port: ${port} 🚀`);
});
