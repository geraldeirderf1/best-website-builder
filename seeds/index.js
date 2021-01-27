const mongoose = require('mongoose');
const List = require('../models/list');

mongoose.connect('mongodb://localhost:27017/best-website-builder', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await List.deleteMany({});
    const l = new List({
        logo: 'https://www.thebest10websitebuilders.com/img/otros/5b956da30eae76c26f208faa9.png',
        promo1: 'Over 500 designer templates',
        promo2: 'Advanced SEO and social tools',
        promo3: 'Free options + premium plans',
        rating: 9.8,
        remark: 'Outstanding',
        link: 'https://www.wix.com/',
        author: '600da89de2e6222ae8bed55a'
    });
    await l.save();
}

seedDB();