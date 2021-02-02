const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const logoSchema = new Schema({
  url: String,
  filename: String
});

logoSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_300');
});

const ListSchema = new Schema({
  logo: [logoSchema],
  promo1: String,
  promo2: String,
  promo3: String,
  rating: Number,
  remark: String,
  link: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

ListSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    });
  }
});

module.exports = mongoose.model('List', ListSchema);