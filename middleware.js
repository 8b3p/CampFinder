const { reviewSchema, campgroundSchema, userSchema } = require('./schemas');
//this is a class for setting an error message and a status code for my errors.
const ExpressError = require('./utility/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


const isAuthorized = async function (req, res, next) {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'Cannot find that campground');
    res.redirect(`/campgrounds`);
  }
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${req.params.id}`);
  };
  next();
};

const isReviewAuthorized = async function (req, res, next) {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    req.flash('error', 'Cannot find that review');
    res.redirect(`/campgrounds/${req.params.id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that');
    return res.redirect(`/campgrounds/${req.params.id}`);
  };
  next();
};

const isLoggedIn = function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be authenticated');
    console.log(req.session);
    return res.redirect('/login');
  };
  next();
};

//validation for editing or creating a campground using joi, very helpful
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

//validation for editing or creating a review using joi, very helpful
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(er => er.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

//validation for editing or creating a user using joi, very helpful
const validateUser = (req, res, next) => {
  const { username, email, password } = req.body;
  const { error } = userSchema.validate({ username, email, password });
  if (error) {
    req.flash('error', error.message)
    res.redirect('/register')
  } else {
    next();
  };
};

module.exports = {
  isAuthorized,
  isLoggedIn,
  validateCampground,
  validateReview,
  validateUser,
  isReviewAuthorized
};