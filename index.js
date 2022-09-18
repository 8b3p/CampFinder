if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

//* to store sessions in my DB and not in memory
const mongoStore = require('connect-mongo');

//*for mongo injection
const mongoSanitize = require('express-mongo-sanitize');

//*for security 
const helmet = require('helmet');

//* for the ejs layout thingy, very helpful 
const engine = require('ejs-mate');

//* for info about the request falan
const morgan = require('morgan');

//the schema for the joi validation, just moved to another file for cleaner code
const methodOverride = require('method-override');
//campgrounds routes
const campgroundRoutes = require('./routes/campgrounds');
//reviews routes
const reviewRoutes = require('./routes/reviews');
//users routes
const userRoutes = require('./routes/user');


const mongoDbUrl = process.env.MONGO_URL;
mongoose.connect(mongoDbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('mongoose connected to mongoDB succesfully');
  })
  .catch(err => {
    console.error('oh no, mongoose error');
    console.log(err);
  });

//!app.use runs for every requrest regardless of anything, its basically a middleware
app.use(morgan('tiny'))
//to make the public directory work if i run the code from anywhere
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.json());

const secret = process.env.SECRET;

const store = mongoStore.create({
  mongoUrl: mongoDbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60
})

store.on("error", function (e) {
  console.log('session store error', e);
})

const sessionConfig = {
  store,
  name: 'thisIsNotTheSessionSid',
  secret: secret || 'mySecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

const scriptSrcUrls = [
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://icanhazdadjoke.com/ ",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dxfvmhgqh/",
        "https://images.unsplash.com/",
        "https://daily.jstor.org/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//all these are for the passport package for the password falan
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this is for the layout thingy.//!engine is a variable for the ejs-mate package
app.engine('ejs', engine);
//to make the views directory work if i run the code from anywhere
app.set('views', path.join(__dirname, 'views'));
//making ejs my view engine, DUH!
app.set('view engine', 'ejs');

//*for mongo injection
app.use(mongoSanitize({
  replaceWith: '_'
}))

//populating the flash message in every ejs template with 'local'
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  res.locals.currentUrl = req.url;
  next();
});

//*the 'campground' routes
app.use('/campgrounds', campgroundRoutes);
//*the 'review' routes
app.use('/campgrounds/:id/reviews', reviewRoutes);
//*the 'user' routes
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/wierddadjokes', (req, res) => {
  res.render('dadJokes');
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'oh no, something went wrong';
  res.status(statusCode).render('error', { err, title: 'Error' });
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});