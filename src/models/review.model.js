import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: false, // Make this true if reviews must be from logged-in users
    },
    name: { // Added for non-logged-in users or to display a name
      type: String,
      trim: true,
      required: function() { return !this.user; } // Required if no user is linked
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
    },
    // You could add a field for which court/booking the review is for, e.g.:
    // courtId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Court", // Assuming you have a Court model
    //   required: false,
    // },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model("Review", reviewSchema);
