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
    port = 3000;


// ==============
// ROUTES
// ==============
const listRoutes = require('./routes/lists');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL;
// mongodb://localhost:27017/best-website-builder
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//     console.log("Database connected");
// });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'secret',
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
    res.locals.page = 'other';

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
    if (req.query.promo1) {
        const regex = new RegExp(escapeRegex(req.query.promo1), 'gi');
        // const regex = new RegExp(escapeRegex(req.query.rating), 'gi');
        const lists = await List.find({promo1: regex});
        res.render('index', { lists, page: 'index' });
    } else {
        const lists = await List.find({});
        res.render('index', { lists, page: 'index' });
    }
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// BASIC ERROR HANDLING
app.use((err, req, res, next) => {
    res.locals.page = 'other';
    const { statusCode = 500 } = err;
    if(!err.message) {
        err.message = 'Oh No, Something Went Wrong!';
    }
    res.status(statusCode).render('error', { err });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    // return rating.replace(/(^[0-9][0-9])\.?([0-9][0-9])?$/g, `${rating}`);
};


app.listen(port, () => console.log(`Sever started on port ${port}`));