const mongoose = require('mongoose');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'the name is required'],
      unique: true,
      trim: true,
      //this is validator
      maxlength: [100, 'the string is too long '],
      minlength: [10, 'the string is too shoort '],
      //custom validate
      // validate: [validator.isAlpha, 'this name must have been only charachter'],
    },
    priceDiscount: {
      type: Number,
      //custom validation can be writen with another way
      validate: {
        validator: function (val) {
          /* "this" point refer to the created object only not on the update one  */
          //we can use alibrary called validator
          return val < this.price;
        },
        message: 'the pricediscount ({VALUE}) should be less than price ',
      },
    },
    duration: {
      type: Number,
      require: [true, 'the durtion is required'],
      // validate: [
      //   function (val) {
      //     return val > 10000;
      //   },
      // "the duration is required"
      // ],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'the maxgroupsize is required '],
    },
    difficulty: {
      type: String,
      require: [true, 'the diffculty is required '],
      //this is validator
      enum: {
        values: ['easy', 'difficulty', 'medium'],
        message: 'the difficulty either to be easy or medium or difficult ',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      //this is validator
      min: [1.0, 'the minimum num must be 1.0 '],
      max: [5.0, 'the maximum num must be 5.0 '],
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'userModel',
      },
    ],
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      require: [true, 'the summary is required'],
      trim: true,
    },
    description: {
      type: String,
      require: [true, 'the summary is required'],
      trim: true,
    },
    price: {
      type: Number,
      require: [true, 'the price is required'],
    },
    imageCover: {
      type: String,
      require: [true, 'the imgCover is required'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// tourSchema.virtual('durationWeeks').get(function () {
//   return this.duration / 7;
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

//virsual populate
tourSchema.virtual('reviews', {
  ref: 'reviewModel',
  localField: '_id',
  foreignField: 'tour',
});
/* DOCUMENT MIDDLE WARE WORK ONLY WITH .SAVE() AND .CREATE() */
// tourSchema.pre('save', function (next) {
//   console.log('***************');
//   console.log(this);
//   console.log('***************');
//   next();
// });
// tourSchema.post('save', function (next) {
//   console.log("document equal",this);
//   next();
// });
/* QUERY MIDDLE WARE */

// tourSchema.post(/^find/, function (docs, next) {
//   // this.find({ secretTout: { $ne: true } });
//   console.log(`the time token is ${new Date() - this.start}`);
//   console.log(docs);
//   next();
// });
/* AGGERATION MIDDLE WARE */

// tourSchema.pre('aggregate', function (next) {
//   console.log(this.pipline());
//   next();
// });

// "Tour" is the name that will be stored in data base
const Tourmodel = mongoose.model('tourModel', tourSchema);

module.exports = Tourmodel;
