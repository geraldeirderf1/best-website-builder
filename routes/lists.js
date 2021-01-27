const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const List = require('../models/list');
const { isLoggedIn, isAuthor, validateList } = require('../middleware');

// ========================
// MIDDLEWARE
// ========================


// INDEX
router.get('/', catchAsync(async (req, res, next) => {
    const lists = await List.find({}).populate('author');
    // console.log(lists);

    res.render('lists/index', { lists, page: 'lists' });
}));

// NEW
router.get('/new', isLoggedIn, (req, res) => {
    res.render('lists/new', { page: 'lists' });
});

// CREATE
router.post('/', isLoggedIn, validateList, catchAsync(async (req, res, next) => {
    // if (!req.body.list) {
    //     throw new ExpressError('Invalid List Data', 400);
    // }
    const list = new List(req.body.list);
    list.author = req.user._id;
    await list.save();
    req.flash('success', 'Successfully created a new list!');
    res.redirect('/lists');
}));

// SHOW
router.get('/:id', catchAsync( async (req, res) => {
    const list = await List.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(list);
    res.render('lists/show', { list });
}));

// EDIT
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const list = await List.findById(id);
    if(!list) {
        req.flash('error', 'Cannot find that list');
        return res.redirect('/lists');
    }
    res.render('lists/edit', { list, page: 'lists' });
}));

// UPDATE
router.put('/:id', isLoggedIn, isAuthor, validateList, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const list = await List.findByIdAndUpdate(id, { ...req.body.list });
    req.flash('success', 'Successfully updated list!');
    res.redirect(`/lists/${list._id}`);
}));

// DESTROY
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await List.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted list!');
    res.redirect('/lists');
}));

module.exports = router;