class Apperr extends Error {
  constructor(message, statusCode) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.isOpertional = true;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'err ';
    Error.captureStackTrace(this, this.constructor); // create stack property on the target object
  }
}
module.exports = Apperr;
