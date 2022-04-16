const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //wont be chosen in .find()method
  },
  confirmPassword: {
    type: String,
    validate: {
      // this work only on .Save or create not work  in update
      validator: function (val) {
        return this.password === val;
      },
      message: 'the password shold be the same as confirmPassword',
    },
    required: [true, 'confirmpasswrd is require'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  changePasswordIn: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  restPasswordExpires: {
    type: Date,
  },
  activate_del: {
    type: Boolean,
    default: true,
    select: false,
  },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function (next) {
  console.log('waiting');
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.confirmPassword = undefined;
  next();
});
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  uerPasswordInDb
) {
  return bcrypt.compare(candidatePassword, uerPasswordInDb);
};
userSchema.methods.isChangepasword = async (jwtTime) => {
  const timeAtPasswordChaned = parseInt(this.changePasswordIn / 1000, 10);
  if (timeAtPasswordChaned) {
    return timeAtPasswordChaned < jwtTime;
  }
  return false;
};

userSchema.methods.createPasswordReset = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //create resetpassword and will be sent to url
  this.passwordResetToken = crypto //to encrypt the password s
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log(this);
  this.restPasswordExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.pre(/^find/, function (next) {
  //this refer to the current query
  this.find({ activate_del: { $ne: false } });
  next();
});
const userModel = mongoose.model('userModel', userSchema);
module.exports = userModel;
