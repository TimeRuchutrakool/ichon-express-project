const prisma = require("../models/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const { productSchema } = require("../validators/productValidator");

exports.getTopSalesProducts = catchAsync(async (req, res, next) => {});

exports.addProduct = catchAsync(async (req, res, next) => {
  const { value, error } = productSchema.validate(req.body);
  if (error) return next(new AppError(error));
  const { id: brandId } = await prisma.brand.findFirst({
    where: { name: value.brandTitle.toUpperCase() },
  });
  const { id: categoryId } = await prisma.category.findFirst({
    where: { name: value.categoryTitle.toUpperCase() },
  });

  const product = await prisma.product.create({
    data: {
      name: value.name,
      price: value.price,
      description: value.description,
      stock: value.stock,
      brandId: brandId,
      categoryId: categoryId,
    },
  });

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

  await prisma.productImage.createMany({
    data: images,
  });

  res.json({
    data: {
      product: product,
      images: images,
    },
  });
});
