import "../db/db.js";
import { popEvent } from "../queue/memoryQueue.js";
import Notification from "../models/notification.model.js";
import { Poll } from "../models/poll.model.js";
import { pushToUser } from "../webSocket/socket.server.js";
console.log("🧠 Notification Worker Running...");

while (true) {
  const event = popEvent();
  console.log("Processing:", event.eventType);

  if (event.eventType === "POLL.CLOSED") {
    await handlePollClosed(event);
  }
}

async function handlePollClosed(event) {
  const { pollId, title } = event.data;

  const poll = await Poll.findById(pollId).populate("voters");

  for (const voter of poll.voters) {
    const notification = await Notification.create({
      userId: voter._id,
      title: "Poll close",
      message: `Poll "${title}" has ended`,
      type: "POLL",
      sourceId: pollId,
    });

    pushToUser(voter._id, notification);
  }
}
