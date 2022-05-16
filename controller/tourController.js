/* eslint-disable prefer-object-spread */
const Tourmodel = require('../models/tourModel');
const Apperror = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../controller/handlerFactory');
/* 6) ALIASING THE FILTERING PROPERTY IN ANEW ROUTE  */
//this will git the top 5 cheapest and hight rate in all tours
exports.aliasTours = (req, res, next) => {
  console.log(req.query);
  req.query.sort = 'ratingsAverage, price';
  req.query.page = '1';
  req.query.limit = '5';
  next();
};

exports.getAlltours = handlerFactory.getAll(Tourmodel);
exports.getOneTour = handlerFactory.getOne(Tourmodel, { path: 'reviews' });
exports.creatTour = handlerFactory.creatOne(Tourmodel);
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

exports.getWithin = catchAsync(async (req, res, next) => {
  const { raduis, lnglat, unit } = req.params;
  const [lng, lat] = lnglat.split(',');
  if (!lng || !lat) {
    return next(
      new Apperror('please enter the langtude and latiude lng,lat'),
      400
    );
  }
  if (unit !== 'mi' && unit !== 'km') {
    return next(
      new Apperror(
        'non suporting unit please enter valid unit mi for mile or km for kilometer '
      ),
      400
    );
  }
  const radDistance = unit === 'mi' ? raduis / 3963.2 : raduis / 6378.1;
  const tourWithin = await Tourmodel.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radDistance],
      },
    },
  });
  res.status(200).json({
    status: 'success',
    lenght: tourWithin.length,
    tours: tourWithin,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  // /distances/center/:lnglat/unit/:unit
  const { lnglat, unit } = req.params;
  const [lng, lat] = lnglat.split(',');
  if (!lng || !lat) {
    return next(
      new Apperror('please enter the langtude and latiude lng,lat'),
      400
    );
  }
  if (unit !== 'mi' && unit !== 'km') {
    return next(
      new Apperror(
        'non suporting unit please enter valid unit mi for mile or km for kilometer '
      ),
      400
    );
  }
  const multiplier = unit === 'mi' ? Math.pow(6.211, -4) : Math.pow(1, -3);
  const distances = await Tourmodel.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        spherical: true,
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    lenght: distances.length,
    tours: distances,
  });
});
