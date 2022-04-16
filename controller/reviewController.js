const reviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../controller/handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params) filter = { tour: req.params.tourid };
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
// exports.creatReview = catchAsync(async (req, res, next) => {
//   if (!req.body.tour) req.body.tour = req.params.tourid;
//   if (!req.body.user) req.body.user = req.user.id;
//   const review = await reviewModel.create(req.body);
//   res.status(200).json({
//     status: 'success',
//     reviews: review,
//   });
// });

exports.deletReview = handlerFactory.deletOne(reviewModel);
exports.updateReview = handlerFactory.updateOne(reviewModel);
exports.creatReview = handlerFactory.creatOne(reviewModel);
exports.getReview = handlerFactory.getOne(reviewModel);
