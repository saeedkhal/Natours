const mongoose = require('mongoose');
const tourModel = require('./tourModel');
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
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.statics.calcAvgRate = async function (tourId) {
  //this refere to the model
  const stat = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await tourModel.findByIdAndUpdate(tourId, {
    ratingsQuantity: stat[0].nRating,
    ratingsAverage: stat[0].avgRating,
  });
};

reviewSchema.post('save', function (doc) {
  //this and doc refer to the doc
  doc.constructor.calcAvgRate(doc.tour);
  //this.constructor.calcAvgRate();
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  //this refer to the query and doc refe to the document
  doc.constructor.calcAvgRate(doc.tour);
});
const reviewModel = mongoose.model('reviewModel', reviewSchema);

module.exports = reviewModel;
