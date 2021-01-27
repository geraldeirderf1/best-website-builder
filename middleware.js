const { listSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const List = require('./models/list');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated && req.user !== undefined){
        return next();
    }
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in');
    return res.redirect('/login');
}


module.exports.validateList = (req, res, next) => {
    
    const { error } = listSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const list = await List.findById(id);
    if (!list.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/lists/${id}`);
    }
    next();
}

// ========================
// MIDDLEWARE FOR REVIEW
// ========================

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/lists/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}