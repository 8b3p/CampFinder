const express = require('express');
const router = express.Router({ mergeParams: true });
//for catching error in an async function falan 
const catchAsync = require('../utility/catchAsync');
const reviews = require('../controllers/reviews')
//the schema for the joi validation, just moved to another file for cleaner code
const { validateReview, isLoggedIn, isReviewAuthorized } = require('../middleware');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthorized, catchAsync(reviews.deleteReview));

module.exports = router;