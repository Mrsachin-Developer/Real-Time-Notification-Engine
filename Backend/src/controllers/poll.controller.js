import { Poll } from "../models/poll.model.js";
import { pushEvent } from "../queue/memoryQueue.js";
import { v4 as uuid } from "uuid";

export const createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: "Question and at least two options are required",
        success: false,
      });
    }

    //  Normalize options into schema format
    const formateOptions = options.map((text) => ({
      text,
    }));

    const poll = await Poll.create({
      question,
      options: formateOptions,
      expiresAt,
      createdBy: req.user.userId,
    });

    // 🔔 EVENT: POLL CREATED
    try {
      pushEvent({
        eventId: uuid(),
        eventType: "POLL.CREATED",
        timestamp: new Date().toISOString(),
        source: "poll-service",
        actor: { userId: req.user.userId },
        data: {
          pollId: poll._id,
          question: poll.question,
        },
      });
    } catch (e) {
      console.error("Event emit failed:", e.message);
    }

    return res.status(201).json({
      message: "Poll is created",
      success: true,
      data: poll,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create poll",
      success: false,
      error: error.message,
    });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.userId;

    if (!optionId) {
      return res.status(400).json({
        message: "Please provide the optionId",
        success: false,
      });
    }

    const updatePoll = await Poll.findOneAndUpdate(
      {
        _id: pollId,
        "options._id": optionId,
        isActive: true,
        voters: { $ne: userId },
      },
      {
        $inc: { "options.$.votes": 1 },
        $addToSet: { voters: userId },
      },
      {
        new: true,
      },
    );

    if (!updatePoll) {
      return res.status(404).json({
        success: false,
        message: "Vote failed (already voted, poll closed, or invalid option)",
      });
    }

    // 🔔 EVENT: VOTE CAST
    try {
      pushEvent({
        eventId: uuid(),
        eventType: "POLL.VOTE_CAST",
        timestamp: new Date().toISOString(),
        source: "poll-service",
        actor: { userId },
        data: {
          pollId,
          optionId,
        },
      });
    } catch (e) {
      console.error("Event emit failed:", e.message);
    }

    res.status(200).json({
      success: true,
      data: updatePoll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Voting failed",
      error: error.message,
    });
  }
};

export const closePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.userId;

    const poll = await Poll.findOneAndUpdate(
      {
        _id: pollId,
        createdBy: userId,
        isActive: true,
      },
      {
        isActive: false,
      },
      { new: true },
    );

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found or already closed",
      });
    }

    // 🔔 EVENT: POLL CLOSED
    try {
      pushEvent({
        eventId: uuid(),
        eventType: "POLL.CLOSED",
        timestamp: new Date().toISOString(),
        source: "poll-service",
        actor: { userId },
        data: {
          pollId: poll._id,
          question: poll.question,
        },
      });
    } catch (e) {
      console.error("Event emit failed:", e.message);
    }

    return res.status(200).json({
      success: true,
      message: "Poll closed successfully",
      data: poll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to close poll",
      error: error.message,
    });
  }
};

export const getResult = async (req, res) => {
  try {
    const { pollId } = req.params;

    const findPoll = await Poll.findById(pollId).select(
      "question options createdAt",
    );
    if (!findPoll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    /**syntax for reduce
     * 
     * 
      array.reduce((accumulator, currentItem) => {
          return newAccumulatorValue;
      }, startingValue)
    
    */

    const totalVotes = findPoll.options.reduce(
      (sum, opt) => sum + opt.votes,
      0,
    );

    const results = findPoll.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
      percentage:
        totalVotes === 0 ? 0 : ((opt.votes / totalVotes) * 100).toFixed(2),
      //toFixed(2) means upto to 2 decimal values
    }));

    return res.status(200).json({
      success: true,
      data: {
        question: findPoll.question,
        totalVotes,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};
