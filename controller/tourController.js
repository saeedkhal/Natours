/* eslint-disable prefer-object-spread */
const Tourmodel = require('../models/tour_model');
const Apifeatures = require('../utils/apiFeatures');
const Apperror = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../controller/handlerFactory');
/* 6) ALIASING THE FILTERING PROPERTY IN ANEW ROUTE  */
//this will git the top 5 cheapest and hight rate in all tours
exports.aliasTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.page = '1';
  req.query.sort = 'ratingsAverage, price';
  next();
};

exports.getAlltours = catchAsync(async (req, res, next) => {
  const features = new Apifeatures(Tourmodel.find(), req.query)
    .filtering()
    .sorting()
    .projection()
    .skipingAndlimiting();
  const allToursArr = await features.mongQueryArr;

  res.status(200);
  res.json({
    status: 'success',
    results: allToursArr.length,
    reqestTime: req.reqestTime,
    data: {
      tours: allToursArr,
    },
  });
});
exports.getOneTour = handlerFactory.getOne(Tourmodel, { path: 'reviews' });
exports.creatToure = handlerFactory.creatOne(Tourmodel);
exports.updateTour = handlerFactory.updateOne(Tourmodel);
exports.deleteTour = handlerFactory.deletOne(Tourmodel);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tourmodel.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        sumPrice: { $sum: '$price' },
      },
    },
    {
      $sort: { maxPrice: 1 },
    },
    // {
    //   $project: { numTours: 1, _id: 0 }, //will display only umTours
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMontholyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tourmodel.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-30T00:00:00.000Z`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //$month is an pipline operation in mongo db lik sum and avg
        numTours: { $sum: 1 },
        toursname: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  // const testing = await Tourmodel.aggregate().unwind('startDates');

  res.status(200).json({
    status: 'success',
    lenght: plan.length,
    data: {
      stats: plan,
    },
  });
});
