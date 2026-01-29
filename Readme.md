# 🗳️ Poll App -- Event-Driven Notification System

> Personal Engineering Notes & System Design Reference\
> Author: Sabya Sachin Mohanta

---

## 🎯 What This Project Is

This project turns a normal **Poll App backend** into a **real-time,
event-driven system**.

Instead of only doing: \> Client → API → Database → Response

It now does: \> Action → Event → Queue → Worker → Database → WebSocket →
User

This means: - Users get **live notifications** - Offline users get
**saved notifications** - System can **scale and survive failures** -
Features are **decoupled**

---

## 🧠 Core Mental Model

### One-Line Rule

> **Truth lives in the Database. Work lives in the Queue. Speed lives in
> WebSockets.**

### System Shape

    [ Poll API ]
         ↓ emits event
    [ Queue ]
         ↓
    [ Worker ]
         ↓
    [ Notification DB ]
         ↓
    [ WebSocket ]
         ↓
    [ User ]

---

## 📦 Folder Structure

    src/
    ├── controllers/        # API logic (poll, user)
    ├── models/            # MongoDB schemas
    │   └── notification.model.js
    ├── queue/             # Event queue (memory or Redis)
    │   └── memoryQueue.js
    ├── worker/            # Background processor
    │   └── notification.worker.js
    ├── websocket/         # Real-time server
    │   └── socket.server.js
    └── routes/
        └── notification.routes.js

---

## 🧩 Core Concepts I Learned

### 1️⃣ Event

An **event is a fact about the past**. Not a command. Not a request.

Examples: - `POLL.CREATED` - `POLL.VOTE_CAST` - `POLL.CLOSED`

### Event Shape (Envelope)

    {
      eventId,       // Unique ID
      eventType,     // What happened
      timestamp,     // When
      source,        // Which service
      actor,         // Who triggered it
      data           // Event-specific info
    }

Purpose: - Prevent duplicates (idempotency) - Enable analytics - Support
retries - Make debugging easy

---

## 2️⃣ Queue (The Box)

The queue stores **messages about what happened** --- not the action
itself.

### Why It Exists

- Absorbs traffic spikes
- Decouples systems
- Prevents data loss on worker crashes
- Allows background processing

### Memory Queue Logic

```js
const queue = [];

export function pushEvent(event) {
  queue.push(event);
}

export async function popEvent() {
  while (queue.length === 0) {
    await new Promise((r) => setTimeout(r, 200));
  }
  return queue.shift();
}
```

### Important Syntax Learned

    await new Promise(r => setTimeout(r, 200));

Means: \> Pause this async function without blocking the whole program

---

## 3️⃣ Worker (System Brain)

A **worker is a Node process without HTTP**.

It only: - Reads events from queue - Applies business rules - Writes
notifications to DB - Pushes live updates

### Core Pattern

```js
while (true) {
  const event = await popEvent();
  handle(event);
}
```

### Purpose

- Keeps API fast
- Handles heavy logic
- Enables scaling (add more workers)

---

## 4️⃣ Notification Database

This is your system's **permanent memory**.

### Schema

```js
{
  (userId, title, message, type, sourceId, isRead, createdAt);
}
```

### Why It Exists

- Offline users can fetch later
- Audit trail
- Read/unread state
- Legal/analytics proof

---

## 5️⃣ WebSocket Server

This is your **real-time delivery channel**.

### Mental Model

HTTP = Ask and wait\
WebSocket = Always connected, server can push anytime

### Core Syntax

```js
const clients = new Map();

clients.set(userId, socket);
clients.get(userId).send(data);
```

### Purpose

- Live notifications
- Real-time UX
- Push-based communication

---

## 🔁 Reliability Patterns

### ACK Concept

A message is only removed from the queue when the worker finishes
processing it.

### Idempotency

Same event should not be processed twice.

Pattern: - Store `eventId` - If already processed → skip

### Outbox Pattern (Conceptual)

Save event in DB first, then send to queue later. Protects against
backend crashes.

---

## 🔥 Syntax You Learned Today

### Destructuring

```js
const { pollId } = req.params;
```

Pulls value from object directly

### Alias Import

```js
import { v4 as uuid } from "uuid";
```

Rename imported function

### Ternary Operator

```js
condition ? value1 : value2;
```

### Atomic Mongo Update

```js
$inc;
$addToSet;
$ne;
```

### Blocking Loop

```js
while (true) {
  await popEvent();
}
```

---

## 🏗️ Event Integration Points

### On Poll Creation

    POLL.CREATED
    → Notify followers

### On Vote

    POLL.VOTE_CAST
    → Analytics / Activity Feed

### On Poll Close

    POLL.CLOSED
    → Notify all voters

---

## 🧠 Engineer Thinking Model

### Always Ask

- What are my events?
- What should be async?
- What must never fail?
- What can be slow?
- Where does truth live?

---

## 🎯 Resume Statement

> Designed and implemented an event-driven notification system using
> queue-based architecture and WebSockets, enabling real-time and
> offline user alerts with background workers, idempotent event
> processing, and scalable service decoupling.

---

## 🔑 One-Line Memory Rule

> **Accept fast. Process later. Notify smart.**

---

## 🚀 Upgrade Path

Current: - In-memory queue

Production: - Redis / Kafka - Retry queues - Dead-letter queues -
Horizontal workers - Load-balanced WebSockets

---

## 🏁 Final Thought

This system is not a feature. It is a **platform pattern** that can be
reused for: - Polls - Banking alerts - Healthcare systems - Social
platforms - SaaS products

---
