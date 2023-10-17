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

exports.searchProduct = catchAsync(async (req, res, next) => {
  const { searchedTitle } = req.params;
  const { sortBy, page, productPerPage } = req.query;
  let orderBy = {};
  if (sortBy === "general") orderBy = { id: "asc" };
  else if (sortBy === "price-asc") orderBy = { price: "asc" };
  else if (sortBy === "price-desc") orderBy = { price: "desc" };
  const brand = await prisma.brand.findFirst({
    where: { name: searchedTitle },
  });
  const where = {
    OR: [
      {
        name: {
          contains: searchedTitle,
        },
      },
      {
        description: {
          contains: searchedTitle,
        },
      },
      {
        brandId: brand?.id,
      },
    ],
  };
  const allproducts = await prisma.product.findMany({
    where: where,
  });

  const products = await prisma.product.findMany({
    take: +productPerPage,
    skip: (Number(page) - 1) * Number(productPerPage),
    orderBy: orderBy,
    where: where,
    include: {
      brand: true,
      ProductImage: {
        distinct: ["productId"],
      },
    },
  });

  res.status(200).json({
    data: {
      count: allproducts.length,
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const params = req.params;
  const productId = Number(params.productId);

  if (!productId)
    return next(new AppError("productId is required to find product"));

  let product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    include: {
      brand: true,
      WishItem:true
    },
  });

  if (!product)
    return next(new AppError(`There is no product with id ${productId}`));

  const productImages = await prisma.productImage.findMany({
    where: {
      productId: productId,
    },
    select: {
      imageUrl: true,
    },
  });

  product.productImages = productImages;

  res.status(200).json({ data: { product } });
});
