const multer = require('multer');
const userModel = require('../models/user_model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('../controller/handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const fileName = `user-${req.user._id}-${Date.now()}.${ext}`;
    console.log(req.user);
    cb(null, fileName);
  },
});

const multerFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('the type of file isnt image '), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadPhoto = upload.single('photo');
const filterObject = (obj, ...allowedKeys) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedKeys.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1)send an error if the useer send an pasword to upade
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'this route to update puplic your date not password go /updateMyPassword to upade password '
      )
    );
  }
  const filteredObj = filterObject(req.body, 'name', 'email');
  //update photo name
  if (req.file) filteredObj.photo = req.file.filename;
  const user = await userModel.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true, //if true will ask validator for the updated field only else will ignore
  });

  res.status(200);
  res.json({
    status: 'success',
    user,
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user.id, {
    activate_del: false,
  });
  res.status(200);
  res.json({
    status: 'success',
    data: null,
  });
});
exports.getAllusers = catchAsync(async (req, res, next) => {
  const allToursuser = await userModel.find();

  res.status(200);
  res.json({
    status: 'success',
    results: allToursuser.length,
    reqestTime: req.reqestTime,
    data: {
      tours: allToursuser,
    },
  });
});

exports.creatUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'this route is not definde',
  });
};

exports.getOneUser = handlerFactory.getOne(userModel);
exports.deleteUser = handlerFactory.deletOne(userModel);
exports.updateUser = handlerFactory.updateOne(userModel);
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});
