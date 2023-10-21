const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().trim().required(),
  shortName: Joi.string().trim().required(),
  price: Joi.number().required(),
  description: Joi.string().trim().required(),
  stock: Joi.number().integer().required(),
  brandTitle: Joi.string().required(),
  categoryTitle: Joi.string().required(),
});

exports.productSchema = productSchema;
