import mongoose from "mongoose";

/** Matches Express backend schema: rating + comment at rest → stars/message in API responses. */
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
  { versionKey: false },
);

reviewSchema.index({ createdAt: -1 });

export function getReviewModel() {
  return mongoose.models.Review ?? mongoose.model("Review", reviewSchema);
}
