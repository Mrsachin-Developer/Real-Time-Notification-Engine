import "../db/db.js";
import { popEvent } from "../queue/memoryQueue.js";
import Notification from "../models/notification.model.js";
import { Poll } from "../models/poll.model.js";
import { pushToUser } from "../webSocket/socket.server.js";

console.log("🧠 Notification Worker Running...");

while (true) {
  const event = await popEvent();

  if (!event || !event.eventType) {
    console.warn("⚠️ Skipping invalid event:", event);
    continue;
  }

  console.log("Processing:", event.eventType);

  if (event.eventType === "POLL.CLOSED") {
    await handlePollClosed(event);
  }
}

async function handlePollClosed(event) {
  const { pollId, question } = event.data;

  console.log("Writing notifications for poll:", pollId);

  const poll = await Poll.findById(pollId);
  if (!poll) {
    console.log("❌ Poll not found");
    return;
  }

  console.log("Voters found:", poll.voters);

  for (const voterId of poll.voters) {
    const userId = voterId.toString(); // normalize

    console.log("Creating notification for user:", userId);

    const notification = await Notification.create({
      userId,
      title: "Poll Closed",
      message: `Poll "${question}" has ended`,
      type: "POLL",
      sourceId: pollId,
    });

    pushToUser(userId, notification);
  }
}
