import { Poll } from "../models/poll.model.js";
import { pushEvent } from "../queue/memoryQueue.js";
import { v4 as uuid } from "uuid";

console.log("⏳ Poll Expiry Scheduler Running");

setInterval(async () => {
  const now = new Date();

  const expiredPolls = await Poll.find({
    isActive: true,
    expiresAt: { $lte: now },
  });

  for (const poll of expiredPolls) {
    poll.isActive = false;
    await poll.save();

    // 🔔 EVENT: POLL CLOSED
    pushEvent({
      eventId: uuid(),
      eventType: "POLL.CLOSED",
      timestamp: new Date().toISOString(),
      source: "poll-scheduler",
      actor: { system: true },
      data: {
        pollId: poll._id,
        question: poll.question,
      },
    });

    console.log("Poll closed:", poll._id.toString());
  }
}, 5000); // runs every 5 seconds
