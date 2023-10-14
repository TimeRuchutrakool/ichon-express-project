const prisma = require("../models/prisma");
const catchAsync = require("../utils/catchAsync");

exports.products = catchAsync(async (req, res, next) => {
  const products = await prisma.product.findMany({});
  res.json({ products });
});
exports.brands = catchAsync(async (req, res, next) => {
  const brands = await prisma.brand.findMany({});
  res.json({ brands });
});
exports.categories = catchAsync(async (req, res, next) => {
  const categories = await prisma.category.findMany({});
  res.json({ categories });
});
exports.users = catchAsync(async (req, res, next) => {
  const users = await prisma.user.findMany({});
  res.json({ users });
});
