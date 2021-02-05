const List = require('../models/list');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res, next) => {

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

  if (req.query.list) {
    const promo1 = new RegExp(escapeRegex(req.query.list.promo1), 'gi');
    const promo2 = new RegExp(escapeRegex(req.query.list.promo2), 'gi');
    const promo3 = new RegExp(escapeRegex(req.query.list.promo3), 'gi');
    const remark = new RegExp(escapeRegex(req.query.list.remark), 'gi');
    const rating = req.query.list.rating;

    if ((rating === '') && (promo1 === '' && promo2 === '' && promo3 === '' && remark === '')) {
      try {
        // execute query with page and limit values
        const lists = await List.find({})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .populate('author')
          .exec();
    
        // get total documents in the Posts collection 
        // const count = await lists.countDocuments();
        const count = await List.countDocuments();

        res.render('lists/index', {
          query: req.query,
          limit: perPage,
          lists: lists,
          current: page,
          count,
          pages: Math.ceil(count / perPage),
          pageName: 'lists'
        });

      } catch (err) {
        console.error(err.message);
      }    
    } else if ((rating === '') && (promo1 !== '' || promo2 !== '' || promo3 !== '' || remark !== '')) {
      try {
        // execute query with page and limit values
        const lists = await List.find({promo1, promo2, promo3, remark})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .populate('author')
          .exec();

        const listCount = await List.find({promo1, promo2, promo3, remark});
    
        // get total documents in the Posts collection 
        const count = await Object.keys(listCount).length;

        res.render('lists/index', {
          query: req.query,
          limit: perPage,
          lists: lists,
          current: page,
          count,
          pages: Math.ceil(count / perPage),
          pageName: 'lists'
        });

      } catch (err) {
        console.error(err.message);
      }
    } else {
      try {
        // execute query with page and limit values
        const lists = await List.find({promo1, promo2, promo3, remark, rating})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .populate('author')
          .exec();

        const listCount = await List.find({promo1, promo2, promo3, remark, rating});
    
        // get total documents in the Posts collection 
        const count = await Object.keys(listCount).length;

        res.render('lists/index', {
          query: req.query,
          limit: perPage,
          lists: lists,
          current: page,
          count,
          pages: Math.ceil(count / perPage),
          pageName: 'lists'
        });

      } catch (err) {
        console.error(err.message);
      }
    }

  } else if (req.query.perPage) {
    try {
      // execute query with page and limit values
      const lists = await List.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('author')
        .exec();
  
      // get total documents in the Posts collection 
      const count = await List.countDocuments();

      res.render('lists/index', {
        query: req.query,
        limit: perPage,
        lists: lists,
        current: page,
        count,
        pages: Math.ceil(count / perPage),
        pageName: 'lists'
      });

    } catch (err) {
      console.error(err.message);
    }

  } else {
    try {
      // execute query with page and limit values
      const lists = await List.find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('author')
        .exec();
  
      // get total documents in the Posts collection 
      const count = await List.countDocuments();

      res.render('lists/index', {
        query: req.query,
        limit: perPage,
        lists: lists,
        current: page,
        count,
        pages: Math.ceil(count / perPage),
        pageName: 'lists'
      });

    } catch (err) {
      console.error(err.message);
    }
  }
}

module.exports.renderNewForm = (req, res) => {
  res.render('lists/new', { pageName: 'lists' });
}

module.exports.createList = async (req, res, next) => {
  const sanitizedList = {
    logo: req.body.list.logo,
    promo1: req.sanitize(req.body.list.promo1),
    promo2: req.sanitize(req.body.list.promo2),
    promo3: req.sanitize(req.body.list.promo3),
    rating: req.body.list.rating,
    remark: req.sanitize(req.body.list.remark),
    link: req.sanitize(req.body.list.link)
  }
  const list = new List(sanitizedList);
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
  res.render('lists/show', { list, pageName: 'show' });
}

module.exports.editList = async (req, res, next) => {
  const { id } = req.params;
  const list = await List.findById(id);
  if (!list) {
    req.flash('error', 'Cannot find that list');
    return res.redirect('/lists');
  }
  res.render('lists/edit', { list, pageName: 'lists' });
}

module.exports.updateList = async (req, res, next) => {
  const { id } = req.params;
  const sanitizedList = {
    logo: req.body.list.logo,
    promo1: req.sanitize(req.body.list.promo1),
    promo2: req.sanitize(req.body.list.promo2),
    promo3: req.sanitize(req.body.list.promo3),
    rating: req.body.list.rating,
    remark: req.sanitize(req.body.list.remark),
    link: req.sanitize(req.body.list.link)
  }
  const list = await List.findByIdAndUpdate(id, { ...sanitizedList });
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

function isEmpty(obj) {
  for(let key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

