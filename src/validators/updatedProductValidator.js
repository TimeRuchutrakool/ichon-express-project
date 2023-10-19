const Joi = require("joi");

const updatedProductSchema = Joi.object({
  name: Joi.string().trim(),
  price: Joi.number(),
  description: Joi.string(),
  stock: Joi.number().integer(),
  brandTitle: Joi.string().trim(),
  categoryTitle: Joi.string().trim(),
});

exports.updatedProductSchema = updatedProductSchema;
