const Apperr = require('../utils/appError');
/* the Three opertional errors */
//1 mongo err
const handleCastErr = (err) =>
  //casting err id due to put a non existing req.parama
  new Apperr(`invalid ${err.path}:${err.stringValue}`, 400);
//2 mongo err
const handleDuplicateUnique = (err) =>
  new Apperr(`this ${JSON.stringify(err.keyValue)} is duplicated `, 400);
//3 mongo err
const handelValiadtionMongoDBErr = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid error input ${errors.join('. ')}`;
  return new Apperr(message, 404);
};
//1 jwt err
const handelJwtTokenErr = () =>
  new Apperr('the token is invalid please sign up', 401);
const handelJwtExpireErr = () =>
  Apperr('access token is  expired please sign in again  ', 401);
//production err hear
const sendProdErr = (err, res) => {
  if (err.isOpertional) {
    //this is Opertional error that we trust that it coming from the Apperror class in utils file
    //so dosnt matter if we mak it visible to client
    res.status(err.statusCode).json({
      status: err.status || 500,
      message: err.message,
    });
  } else {
    //prgramming error coms from code or  packges and didnt want to make it vissble to the client
    console.error('ERROR', err);
    res.status(err.statusCode).json({
      status: 'fail',
      message: 'somthing went Wrong',
    });
  }
};

//develper error here
const sendDevErr = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    // eslint-disable-next-line prefer-object-spread
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err }; //copy the object
    if (err.name === 'CastError') error = handleCastErr(error); //Cster err is err of passing unfound req.params
    if (err.code === 11000) error = handleDuplicateUnique(error);
    if (err.name === 'ValidationError')
      error = handelValiadtionMongoDBErr(error);
    if (err.name === 'JsonWebTokenError') error = handelJwtTokenErr(error);
    if (err.name === 'TokenExpiredError') error = handelJwtExpireErr(error);
    sendProdErr(error, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendDevErr(err, res);
  }
};
