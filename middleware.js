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




module.exports.href = function href(req) {

    return function(prev, params) {

        var query = clone(req.query);

        if (typeof prev === 'object') {
        params = prev;
        prev = false;
        } else {
        prev = (typeof prev === 'boolean') ? prev : false;
        query.page = parseInt(query.page, 10);
        query.page = prev ? query.page-= 1 : query.page += 1;
        query.page = (query.page < 1) ? 1 : query.page;
        }

        // allow overriding querystring params
        // (useful for sorting and filtering)
        // another alias for `_.assign` is `_.extend`
        if (isObject(params))
        query = assign(query, params);

        return url.parse(req.originalUrl).pathname + '?' + qs.stringify(query);

    };
};
  
module.exports.hasNextPages = function hasNextPages(req) {
return function(pageCount) {
    if (typeof pageCount !== 'number' || pageCount < 0)
    throw new Error('express-paginate: `pageCount` is not a number >= 0');
    return req.query.page < pageCount;
};
};
  
module.exports.getArrayPages = function(req) {
    return function(limit, pageCount, currentPage) {
        var maxPage = pageCount;

        // limit default is 3
        limit = limit || 3;

        if (typeof limit !== 'number' || limit < 0)
        throw new Error('express-paginate: `limit` is not a number >= 0');

        if (typeof pageCount !== 'number' || pageCount < 0)
        throw new Error('express-paginate: `pageCount` is not a number >= 0');

        currentPage = parseInt(currentPage, 10);
        if (Number.isNaN(currentPage) || currentPage < 0)
        throw new Error('express-paginate: `currentPage` is not a number >= 0');

        if (limit > 0) {
        var end = Math.min(Math.max(currentPage + Math.floor(limit / 2), limit), pageCount);
        var start = Math.max(1, (currentPage < (limit - 1)) ? 1 : (end - limit) + 1);

        var pages = [];
        for (var i = start; i <= end; i++) {
            pages.push({
            number: i,
            url: exports.href(req)()
            .replace('page=' + (currentPage + 1), 'page=' + i)
            });
        }

        return pages;
        }
    }
}

module.exports.middleware = function middleware(limit, maxLimit) {

    var _limit = (typeof limit === 'number') ? parseInt(limit, 10) : 10;
  
    var _maxLimit = (typeof maxLimit === 'number') ? parseInt(maxLimit, 10) : 50;
  
    return function _middleware(req, res, next) {
  
      req.query.page = (typeof req.query.page === 'string') ? parseInt(req.query.page, 10) || 1 : 1;
  
      req.query.limit = (typeof req.query.limit === 'string') ? parseInt(req.query.limit, 10) || 0 : _limit;
  
      if (req.query.limit > _maxLimit)
        req.query.limit = _maxLimit;
  
      if (req.query.page < 1)
        req.query.page = 1;
  
      if (req.query.limit < 0)
        req.query.limit = 0;
  
      req.skip = req.offset = (req.query.page * req.query.limit) - req.query.limit;
  
      res.locals.paginate = {};
      res.locals.paginate.page = req.query.page;
      res.locals.paginate.limit = req.query.limit;
      res.locals.paginate.href = exports.href(req);
      res.locals.paginate.hasPreviousPages = req.query.page > 1;
      res.locals.paginate.hasNextPages = exports.hasNextPages(req);
      res.locals.paginate.getArrayPages = exports.getArrayPages(req);
  
      next();
  
    };
  
  };