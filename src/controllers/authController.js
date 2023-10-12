const AppError = require("../utils/appError");
const prisma = require("../models/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signUpSchema, loginSchema } = require("../validators/authValidator");
const catchAsync = require("../utils/catchAsync");

exports.signup = catchAsync(async (req, res, next) => {
  const { value, error } = signUpSchema.validate(req.body);
  if (error) return next(new AppError(error.message, 400));
  value.password = await bcrypt.hash(value.password, 12);

  const user = await prisma.user.create({
    data: value,
  });
  const payload = { userId: user.id };
  const accessToken = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  delete user.password;

  res.status(201).json({ data: { accessToken, user } });
});

exports.login = catchAsync(async (req, res, next) => {
  const { value, error } = loginSchema.validate(req.body);
  if (error) return next(new AppError(error.message, 400));
  const user = await prisma.user.findFirst({
    where: { email: value.email },
  });
  if (!user) return next(new AppError("Invalid credential"));
  const isMatched = await bcrypt.compare(value.password, user.password);
  if (!isMatched) return next(new AppError("Invalid credential"));
  const payload = { userId: user.id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  delete user.password;
  res.status(200).json({ data: { accessToken } });
});
