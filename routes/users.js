const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Successfully created a new user');
            res.redirect('/');
        });
        // await passport.authenticate('local')(req, res, () => res.redirect('/'));
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
    
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', 
    { 
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
    req.flash('success', `Welcome Back ${req.user.username}`);
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    return res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully loged out');
    res.redirect('/lists');
});

module.exports = router;