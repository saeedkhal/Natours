const Apperror = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Apifeatures = require('../utils/apiFeatures');

exports.deletOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);
    if (!deletedDoc) {
      return next(
        new Apperror(`${req.params.id} is invalid id or docs isnt exist`)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, //to run validator like require and max and min length
    });
    if (!updatedDoc) {
      return next(
        new Apperror(`${req.params.id} is invalid id or tour isnt exist`)
      );
    }
    res.status(200).json({
      status: 'success',
      data: updatedDoc,
    });
  });

exports.creatOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const createdDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: createdDoc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      console.log(popOptions);
      query = query.populate(popOptions);
    }
    const getDoc = await query;

    if (!getDoc) {
      return next(
        new Apperror(`${req.params.id} is invalid id or tour isnt exist`)
      );
    }
    res.status(200).json({
      status: 'success',
      data: getDoc,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //filter fot the review
    let filter = {};
    if (req.params.tourid) {
      filter = { tour: req.params.tourid };
    }
    const features = new Apifeatures(Model.find(filter), req.query)
      .filtering()
      .sorting()
      .projection()
      .skipingAndlimiting();
    const doc = await features.mongQueryArr.explain();

    res.status(200);
    res.json({
      status: 'success',
      results: doc.length,
      reqestTime: req.reqestTime,
      data: {
        data: doc,
      },
    });
  });
