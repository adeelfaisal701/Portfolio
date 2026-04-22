import mongoose from "mongoose";

/** Matches API fields: rating + comment at rest; serialized to stars/message for the Next.js UI. */
const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

reviewSchema.index({ createdAt: -1 });

export const Review = mongoose.models.Review ?? mongoose.model("Review", reviewSchema);
