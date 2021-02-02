const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const List = require('../models/list');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const { listSchema, reviewSchema } = require('../schemas');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');




// Create review
router.post('/reviews', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Edit Review
router.get('/reviews/:reviewId/edit', isLoggedIn, isReviewAuthor, catchAsync(reviews.editReview));

// Update
router.put('/reviews/:reviewId', isLoggedIn, isReviewAuthor, validateReview, catchAsync(reviews.updateReview));

// Destroy review
router.delete('/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));



module.exports = router;