const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getAllTours
  )
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router.use(
  '/:tourId/reviews',
  authController.protect,
  authController.restrictTo('user')
);

router
  .route('/:tourId/reviews')
  .get(reviewController.getAllReviews)
  .post(reviewController.setTourUserIds, reviewController.createReview);

module.exports = router;
