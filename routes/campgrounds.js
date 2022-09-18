const express = require('express');
const router = express.Router({ mergeParams: true });
const campgrounds = require('../controllers/campgrounds');
//for catching error in an async function falan 
const catchAsync = require('../utility/catchAsync');
//the schema for the joi validation, just moved to another file for cleaner code
const { isLoggedIn, isAuthorized, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .patch(isLoggedIn, isAuthorized, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
  .delete(isLoggedIn, isAuthorized, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(campgrounds.renderEditForm));

module.exports = router;