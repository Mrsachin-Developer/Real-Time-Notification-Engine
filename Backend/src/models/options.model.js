import mongoose from "mongoose";

export const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    votes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true }, // each vote gets its own id
);
