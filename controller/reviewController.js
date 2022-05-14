const reviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../controller/handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter;
  console.log(req.params);
  if (req.params.tourid) {
    filter = { tour: req.params.tourid };
  }
  const allReviews = await reviewModel.find(filter);
  res.status(200).json({
    status: 'success',
    reviews: allReviews,
  });
});
exports.setUserAndTour = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourid;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.deletReview = handlerFactory.deletOne(reviewModel);
exports.updateReview = handlerFactory.updateOne(reviewModel);
exports.creatReview = handlerFactory.creatOne(reviewModel);
exports.getReview = handlerFactory.getOne(reviewModel);
