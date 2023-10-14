const prisma = require("../models/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const { productSchema } = require("../validators/productValidator");

exports.getTopSalesProducts = catchAsync(async (req, res, next) => {});

exports.addProduct = catchAsync(async (req, res, next) => {
  const { value, error } = productSchema.validate(req.body);
  //   CHECK BRAND AND CATEGORY IF EXISTS
  if (error) return next(new AppError(error));
  let brand = await prisma.brand.findFirst({
    where: { name: value.brandTitle.toUpperCase() },
  });
  if (!brand)
    brand = await prisma.brand.create({
      data: { name: value.brandTitle.toUpperCase() },
    });
  let category = await prisma.category.findFirst({
    where: { name: value.categoryTitle.toUpperCase() },
  });
  if (!category)
    category = await prisma.category.create({
      data: { name: value.categoryTitle.toUpperCase() },
    });
  // CREATE PRODUCT
  const product = await prisma.product.create({
    data: {
      name: value.name,
      price: value.price,
      description: value.description,
      stock: value.stock,
      brandId: brand.id,
      categoryId: category.id,
    },
  });
  // UPLOAD PRODUCT IMAGES
  if (!req.files) return next("Product image is required");

  const urls = [];
  const files = req.files;
  for (const file of files) {
    const { path } = file;
    const url = await upload(path);
    urls.push(url);
    fs.unlink(path);
  }

  const images = [];
  for (const image of urls) {
    images.push({ imageUrl: image, productId: product.id });
  }
  //   CREATE PRODUCT IMAGE
  await prisma.productImage.createMany({
    data: images,
  });

  res.status(201).json({
    data: {
      product: product,
      images: images,
    },
  });
});
