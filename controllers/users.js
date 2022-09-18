const User = require('../models/user');

module.exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, error => {
      if (error) {
        req.flash('error', error.message);
        return req.redirect('/register');
      } else {
        req.flash('success', 'Welcome to yelpcamp');
        res.redirect('/campgrounds');
      }
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register');
  };
};

module.exports.renderRegisterForm = (req, res) => {
  res.render('users/register', { title: 'register' });
};

module.exports.renderLoginForm = (req, res) => {
  res.render('users/login', { title: 'Login' });
};

module.exports.login = async (req, res) => {
  req.flash('success', 'Welcome back');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(`${redirectUrl}`);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye');
  res.redirect('/campgrounds');
};