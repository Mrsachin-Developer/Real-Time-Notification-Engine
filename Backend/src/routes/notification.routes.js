import express from "express";
import Notification from "../models/notification.model.js";
import checkpoint from "../middlewares/checkpoint.middleware.js";

const router = express.Router();

// to get the notification
router.get("/", checkpoint, async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// to mark the notification  read
router.patch("/read", checkpoint, async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id },
    { $set: { isRead: true } },
  );

  res.json({ message: "All notifications marked as read" });
});

export default router;
