const List = require('../models/list');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
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
}

module.exports.editReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const list = await List.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash('error', 'Could not find that review');
    return res.redirect(`/lists/${id}`);
  }
  res.render(`reviews/edit`, { list, review, page: 'editReview' });
}

module.exports.updateReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findByIdAndUpdate(reviewId, { ...req.body.review });
  req.flash('success', 'Successfully updated review!');
  res.redirect(`/lists/${id}`);
}

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await List.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(req.params.reviewId);
  res.redirect(`/lists/${id}`);
}