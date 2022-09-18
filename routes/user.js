const express = require('express');
const router = express.Router({ mergeParams: true });
//for catching error in an async function falan 
const catchAsync = require('../utility/catchAsync');
const users = require('../controllers/users')
//the schema for the joi validation, just moved to another file for cleaner code
const { validateUser } = require('../middleware');
const passport = require('passport')

router.route('/register')
  .get(users.renderRegisterForm)
  .post(validateUser, catchAsync(users.createUser));

router.route('/login')
  .get(users.renderLoginForm)
  .post(passport.authenticate('local', {
    failureFlash: true, 
    failureRedirect: '/login'
   }), users.login)

router.get('/logout', users.logout);

module.exports = router;
