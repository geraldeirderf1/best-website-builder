const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const List = require('../models/list');
const lists = require('../controllers/lists');
const { isLoggedIn, isAuthor, validateList } = require('../middleware');
const multer  = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// ========================
// MIDDLEWARE
// ========================

router.route('/')
    // INDEX
    .get(isLoggedIn, catchAsync(lists.index))
    // CREATE
    .post(isLoggedIn, upload.array('list[logo]'), validateList, catchAsync(lists.createList));

// NEW
router.get('/new', isLoggedIn, lists.renderNewForm);

router.route('/:id')
    // SHOW
    .get(catchAsync(lists.showList))
    // UPDATE
    .put(isLoggedIn, isAuthor, upload.array('list[logo]'), validateList, catchAsync(lists.updateList))
    // DELETE
    .delete(isLoggedIn, isAuthor, catchAsync(lists.deleteList));

// EDIT
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(lists.editList));

module.exports = router;