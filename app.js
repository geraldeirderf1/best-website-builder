if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express'),
    app = express(),
    path = require('path'),
    ejsMate = require('ejs-mate'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    expressSanitizer = require('express-sanitizer'),
    flash = require('connect-flash'),
    List = require('./models/list'),
    catchAsync = require('./utils/catchAsync'),
    User = require('./models/user'),
    Review = require('./models/review'),
    {listSchema, reviewSchema} = require('./schemas'),
    ExpressError = require('./utils/ExpressError'),
    MongoDBStore = require('connect-mongo')(session),
    port = process.env.PORT || 3000;


// ==============
// ROUTES
// ==============
const listRoutes = require('./routes/lists');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/best-website-builder';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

const secret = process.env.SECRET || 'secret';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        // new Date(Date.now() + (30 * 86400 * 1000)),
        maxAge: Date.now() + (1000 * 60 * 60 * 24 * 7)
    }
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.pageName = 'other';

    next();
});

app.use('/lists', listRoutes);
app.use('/lists/:id', reviewRoutes);
app.use('/', userRoutes);

// ========================
// RESTFUL ROUTES
// ========================

// HOMEPAGE
app.get('/', catchAsync(async (req, res, next) => {

    if (isEmpty(req.query)) {
        var perPage = 5;
    } else {
      if (req.query.perPage !== undefined) {
        var perPage = parseInt(req.query.perPage);
      } else {
        var perPage = 5;
      }
    }
    const page = req.query.page || 1;

    try {
        // execute query with page and limit values
        const lists = await List.find({})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .populate('author')
          .exec();
    
        // get total documents in the Posts collection 
        const count = await List.countDocuments();

        res.render('index', {
          query: req.query,
          limit: perPage,
          lists: lists,
          current: page,
          count,
          pages: Math.ceil(count / perPage),
          pageName: 'index'
        });
  
  
      } catch (err) {
        console.error(err.message);
      }
    // const lists = await List.find({});
    // res.render('index', { lists, page: 'index' });
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// BASIC ERROR HANDLING
app.use((err, req, res, next) => {
    res.locals.pageName = 'other';
    const { statusCode = 500 } = err;
    if(!err.message) {
        err.message = 'Oh No, Something Went Wrong!';
    }
    res.status(statusCode).render('error', { err });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function isEmpty(obj) {
    for(let key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }


app.listen(port, () => console.log(`Sever started on port ${port}`));