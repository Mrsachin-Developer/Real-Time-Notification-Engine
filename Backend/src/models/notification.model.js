import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  useId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  message: String,
  sourceId: String,
  type: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("Notification", NotificationSchema);
