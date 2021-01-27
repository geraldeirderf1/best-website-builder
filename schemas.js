const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.listSchema = Joi.object({
    list: Joi.object({
        logo: Joi.string().required(),
        promo1: Joi.string().required(),
        promo2: Joi.string().required(),
        promo3: Joi.string().required(),
        rating: Joi.number().required().min(0).max(10),
        remark: Joi.string().required(),
        link: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        body: Joi.string().required()
    }).required()
});