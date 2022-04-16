const Apperror = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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
    // const newTour = new Tourmodel({});
    // newTour.save();
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
    if (popOptions) query = query.populate(popOptions);
    getDoc = await query;

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
