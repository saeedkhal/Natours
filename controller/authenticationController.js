const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const userModel = require('../models/user_model');
const Apperr = require('../utils/appError');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

//this function for restrict some function to a specific user
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new Apperr('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

const getSignToken = (id) =>
  jwt.sign({ id: id }, process.env.JWt_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = getSignToken(user.id);
  const cookieOptions = {
    secure: false,
    expires: new Date(
      Date.now() + process.env.JWt_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; //to prevent it from show in res

  // 3) If everything ok, send token to client
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    confirmPassword: req.body.confirmPassword,
  });
  createSendToken(newUser, 201, res);
});
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)check if there is no email or no password enter from user
  if (!email || !password) {
    return next(new Apperr('please enter email or password ', 400));
  }

  // 2) Check if user exists && password is in our database
  const user = await userModel.findOne({ email: email }).select('+password');
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new Apperr('you never sign up please sign up first ', 401));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    next(new Apperr('you nerver loged in please lgo in first ', 401));
  }
  // 2) Verification token check if the token is vaaild
  const decodePayload = await promisify(jwt.verify)(
    token,
    process.env.JWt_SECRET
  );
  // var decoded = jwt.verify(token, process.env.JWt_SECRET);
  // console.log(decoded); // bar

  //decodepaylode{
  //   id:"dnkdjnvd",
  //   iot:1633561895,,
  //   exp:1633561923
  // }
  // 3) Check if user still exists
  const currentuser = await userModel.findById(decodePayload.id);
  if (!currentuser) {
    return next(new Apperr('the user isnt sound please sign up ', 401));
  }
  // 4) Check if user change his password
  if (await currentuser.isChangepasword(decodePayload.iat)) {
    return next(
      new Apperr(
        'password is changed after you get the token please sign in again  ',
        401
      )
    );
  }
  req.user = currentuser;

  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const currentUser = await userModel.findOne({ email: req.body.email });
  if (!currentUser) {
    return next(new Apperr('no user with this email '));
  }
  // 2) Generate the random reset token and save it avraiable in db
  const userResetPassword = await currentUser.createPasswordReset();
  //because of we encrypte the password it will give us err that password and its confirm not equal
  await currentUser.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}//:${req.get(
    'host'
  )}/api/v1/users/resetPassword/${userResetPassword}`;
  const message = `Forgot your password? Submit a PATCH request with your 
      new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget 
      your password, please ignore this email!`;
  await sendEmail({
    email: currentUser.email,
    subject: 'Your password reset token (valid for 10 min)',
    message,
  });
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)get user based o the resetPasswodToken
  const hasheRestToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  const user = await userModel.findOne({
    passwordResetToken: hasheRestToken,
    restPasswordExpires: { $gt: Date.now() },
  });

  if (!user) next(new Apperr('your reset token is expired'));
  //2)if its ok reset password and give the jwt
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.restPasswordExpires = undefined;
  //we use user.save instead of user update baecause of we eed check validator
  await user.save();
  //3) change the update password at field
  // 4) Log the user in, send JWT

  createSendToken(user, 201, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  console.log(req.user);
  const user = await userModel.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new Apperr('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();

  // User.findByIdAndUpdate will NOT work as intended!
  createSendToken(user, 201, res);

  // 4) Log user in, send JWT
});
