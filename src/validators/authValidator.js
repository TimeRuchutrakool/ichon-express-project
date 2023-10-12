const Joi = require("joi");

const signUpSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .trim()
    .required()
    .strip(),
});

exports.signUpSchema = signUpSchema;

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9]{6,30}$/)
    .required(),
});

exports.loginSchema = loginSchema;
