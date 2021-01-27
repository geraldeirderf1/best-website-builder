const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const List = require('../models/list');
const Review = require('../models/review');
const { listSchema, reviewSchema } = require('../schemas');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');




// Create review
router.post('/reviews', isLoggedIn, validateReview, catchAsync( async (req, res) => {
    const list = await List.findById(req.params.id);
    const sanitizedReview = {
        body: req.sanitize(req.body.review.body),
        rating: req.sanitize(req.body.review.rating)
    }
    const review = new Review(sanitizedReview);
    review.author = req.user._id;
    list.reviews.push(review);
    await review.save();
    await list.save();
    req.flash('success', 'Successfully created a review');
    res.redirect(`/lists/${list._id}`);
}));


// Destroy review
router.delete('/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    await List.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/lists/${id}`);
}));


module.exports = router;