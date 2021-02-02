const List = require('../models/list');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res, next) => {

  if (req.query.list) {

    const promo1 = new RegExp(escapeRegex(req.query.list.promo1), 'gi');
    const promo2 = new RegExp(escapeRegex(req.query.list.promo2), 'gi');
    const promo3 = new RegExp(escapeRegex(req.query.list.promo3), 'gi');
    const remark = new RegExp(escapeRegex(req.query.list.remark), 'gi');
    const rating = req.query.list.rating;

    if ((rating === '') && (promo1 === '' && promo2 === '' && promo3 === '')) {
      const lists = await List.find({}).populate('author');
      res.render('lists/index', { lists, page: 'lists' });
    } else if ((rating === '') && (promo1 !== '' || promo2 !== '' || promo3 !== '')) {
      const lists = await List.find({promo1, promo2, promo3, remark}).populate('author');
      res.render('lists/index', { lists, page: 'lists' });
    } else {
      const lists = await List.find({promo1, promo2, promo3, remark, rating}).populate('author');
      res.render('lists/index', { lists, page: 'lists' });
    }
    
  } else {
    const lists = await List.find({}).populate('author');
    res.render('lists/index', { lists, page: 'lists' });
  }

}

module.exports.renderNewForm = (req, res) => {
  res.render('lists/new', { page: 'lists' });
}

module.exports.createList = async (req, res, next) => {
  const list = new List(req.body.list);
  list.logo = req.files.map(f => ({ url: f.path, filename: f.filename }));
  // list.logo = {
  //   url: req.file.path,
  //   filename: req.file.filename
  // };
  list.author = req.user._id;
  await list.save();
  req.flash('success', 'Successfully created a new list!');
  res.redirect('/lists');
}

module.exports.showList = async (req, res) => {
  const list = await List.findById(req.params.id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  res.render('lists/show', { list, page: 'show' });
}

module.exports.editList = async (req, res, next) => {
  const { id } = req.params;
  const list = await List.findById(id);
  if (!list) {
    req.flash('error', 'Cannot find that list');
    return res.redirect('/lists');
  }
  res.render('lists/edit', { list, page: 'lists' });
}

module.exports.updateList = async (req, res, next) => {
  const { id } = req.params;
  const list = await List.findByIdAndUpdate(id, { ...req.body.list });
  list.logo = req.files.map(f => ({ url: f.path, filename: f.filename }));
  // if(req.body.logo){
  //     list.logo = {
  //         url: req.file.path,
  //         filename: req.file.filename
  //     };
  // }
  await list.save();
  if (req.body.deleteImage) {
    for (let filename of req.body.deleteImage) {
      await cloudinary.uploader.destroy(filename);
    }
    await list.updateOne({ $pull: { logo: { filename: { $in: req.body.deleteImage } } } });
  }
  req.flash('success', 'Successfully updated list!');
  res.redirect(`/lists/${list._id}`);
}

module.exports.deleteList = async (req, res, next) => {
  const { id } = req.params;
  if (req.body.deleteImage) {
    for (let filename of req.body.deleteImage) {
      await cloudinary.uploader.destroy(filename);
    }
  }
  await List.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted list!');
  res.redirect('/lists');
}


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

