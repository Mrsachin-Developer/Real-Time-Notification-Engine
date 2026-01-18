import mongoose from "mongoose";
import { optionSchema } from "./options.model.js";

const pollSchema = new mongoose.Schema(
  {
    options: {
      type: [optionSchema],
      validate: {
        validator: function (arr) {
          return arr.length >= 2;
        },
        message: "A poll must have at least 2 options",
      },
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
      // Why Index This?
      // You’ll eventually want:
      // “Show me all polls created by this user”
    },
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // It means Every voter is a user in the system. it stores the User IDs of people who voted prevent from cheating
      },
    ],
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Poll = mongoose.model("Poll", pollSchema);
