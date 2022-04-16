const express = require('express');

const reviewRouter = require('./reviewRouter');
const tourController = require('../controller/tourController');
const authenticationController = require('../controller/authenticationController');
// const reviewController = require('../controller/reviewController');

const router = express.Router();

router.use('/:tourid/reviews', reviewRouter);
// router.param('tourid', tourController.checkId);
router
  .route('/')
  .get(authenticationController.protect, tourController.getAlltours)
  .post(tourController.creatToure);
// .post(tourController.checkBody, tourController.creatToure);

// router.route('/gettourstats').get(tourController.getTourStats);

router
  .route('/Top-5-cheep')
  .get(tourController.aliasTours, tourController.getAlltours);

router.route('/getTourStats').get(tourController.getTourStats);
router
  .route('/monthlyTourPlan/:year')
  .get(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMontholyPlan
  );

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// router
//   .route('/:tourid/reviews')
//   .post(
//     authenticationController.protect,
//     authenticationController.restrictTo('user'),
//     reviewController.creatReview
//   );
module.exports = router;
