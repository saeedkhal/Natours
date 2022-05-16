const express = require('express');
const authenticationController = require('../controller/authenticationController');
const reviewController = require('../controller/reviewController');

//merge params comes from nexted params  ==> router.use()
const router = express.Router({ mergeParams: true });

router.use(authenticationController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authenticationController.protect,
    authenticationController.restrictTo('user'),
    reviewController.setUserAndTour,
    reviewController.creatReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authenticationController.protect,
    // user suppose not allowed to remove any comment
    authenticationController.restrictTo('admin', 'user'),
    reviewController.deletReview
  )
  .patch(
    authenticationController.protect,
    authenticationController.restrictTo('admin', 'user'),
    reviewController.updateReview
  );
module.exports = router;
