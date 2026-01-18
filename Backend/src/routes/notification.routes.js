import express from "express";
import Notification from "../models/notification.model.js";
import checkpoint from "../middlewares/checkpoint.midddleware.js"; // 🔥 fixed spelling

const router = express.Router();

// 🔔 Get notifications (offline / history)
router.get("/", checkpoint, async (req, res) => {
  const userId = req.user.userId.toString(); // 🔥 normalize

  console.log("Looking for notifications for user:", userId);

  const notifications = await Notification.find({
    userId,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// ✅ Mark notifications as read
router.patch("/read", checkpoint, async (req, res) => {
  const userId = req.user.userId.toString(); // 🔥 normalize

  await Notification.updateMany({ userId }, { $set: { isRead: true } });

  res.json({ message: "All notifications marked as read" });
});

export default router;
