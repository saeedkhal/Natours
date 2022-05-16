const reviewModel = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../controller/handlerFactory');

exports.setUserAndTour = (req, res, next) => {
  console.log('saeed');
  if (!req.body.tour) req.body.tour = req.params.tourid;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = handlerFactory.getAll(reviewModel);
exports.deletReview = handlerFactory.deletOne(reviewModel);
exports.updateReview = handlerFactory.updateOne(reviewModel);
exports.creatReview = handlerFactory.creatOne(reviewModel);
exports.getReview = handlerFactory.getOne(reviewModel);
