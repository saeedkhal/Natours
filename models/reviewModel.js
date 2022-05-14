const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'the rrview should not be empty'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'tourModel',
      require: [true, 'review must belong to a tour '],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'userModel',
      require: [true, 'review must belong to a user '],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const reviewModel = mongoose.model('reviewModel', reviewSchema);

module.exports = reviewModel;
