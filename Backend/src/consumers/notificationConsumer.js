import { popEvent } from "../queue/memoryQueue.js";
import { pushToUser } from "../realtime/socketServer.js";

console.log("🔁 Notification Consumer Running");

setInterval(() => {
  const event = popEvent();
  if (!event) return;

  switch (event.eventType) {
    case "POLL.CREATED":
      pushToUser(event.actor.userId, {
        type: "POLL_CREATED",
        message: "Your poll was created successfully",
        pollId: event.data.pollId,
      });
      break;

    case "POLL.VOTE_CAST":
      pushToUser(event.actor.userId, {
        type: "VOTE_CONFIRMED",
        message: "Your vote has been recorded",
        pollId: event.data.pollId,
      });
      break;

    case "POLL.CLOSED":
      pushToUser(event.data.createdBy || event.actor.userId, {
        type: "POLL_ENDED",
        message: "Your poll has ended. Results are ready!",
        pollId: event.data.pollId,
      });
      break;

    default:
      console.log("Unhandled event:", event.eventType);
  }
}, 300);
