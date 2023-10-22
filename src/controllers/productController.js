const prisma = require("../models/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const { productSchema } = require("../validators/productValidator");
const {
  updatedProductSchema,
} = require("../validators/updatedProductValidator");

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
      shortName: value.shortName,
      price: value.price,
      description: value.description,
      stock: value.stock,
      brandId: brand.id,
      categoryId: category.id,
    },
  });
  await prisma.sales.create({
    data: {
      productId: product.id,
      salesAmount: 0,
    },
  });
  // UPLOAD PRODUCT IMAGES
  if (!req.files) return next(new AppError("Product image is required"));

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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        shortName: {
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

  const data = products.map((product) => {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      brand: product.brand.name,
      imageUrl: product.ProductImage[0].imageUrl,
    };
  });

  res.status(200).json({
    data: {
      count: allproducts.length,
      products: data,
    },
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      WishItem: true,
      ProductImage: true,
    },
  });
  if (!product)
    return next(new AppError(`There is no product with id ${productId}`));
  const data = {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description,
    stock: product.stock,
    brand: product.brand.name,
    wish: product.WishItem,
    images: product.ProductImage.map((image) => {
      return { id: image.id, imageUrl: image.imageUrl };
    }),
  };

  res.status(200).json({ data });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await prisma.category.findMany({
    include: {
      Product: true,
    },
  });

  const data = categories.map((category) => {
    return {
      id: category.id,
      name: category.name,
      products: category.Product.map((product) => {
        return { id: product.id, name: product.shortName };
      }),
    };
  });

  res.json({
    data: { categories: data },
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.getTopSalesProducts = catchAsync(async (req, res, next) => {
  const sales = await prisma.sales.findMany({
    take: 10,
    orderBy: {
      salesAmount: "desc",
    },
    include: {
      product: {
        include: {
          ProductImage: {
            distinct: ["productId"],
          },
          brand: true,
        },
      },
    },
  });

  const data = sales.map((product) => {
    return {
      id: product.productId,
      name: product.product.name,
      price: product.product.price,
      description: product.product.description,
      brand: product.product.brand.name,
      imageUrl: product.product.ProductImage[0].imageUrl,
    };
  });

  res.json({ data: data });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.getNewArrival = catchAsync(async (req, res, next) => {
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      ProductImage: {
        distinct: ["productId"],
      },
      brand: true,
    },
  });
  const data = products.map((product) => {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      brand: product.brand.name,
      imageUrl: product.ProductImage[0].imageUrl,
    };
  });

  res.json({
    data: data,
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const products = await prisma.product.findMany({
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    include: { brand: true, category: true },
  });

  // SHAPING
  const data = products.map((product) => {
    return {
      id: product.id,
      name: product.name,
      shortName: product.shortName,
      price: product.price,
      description: product.description,
      stock: product.stock,
      brandTitle: product.brand.name,
      categoryTitle: product.category.name,
    };
  });

  res.json({
    data: { products: data },
  });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.updateProduct = catchAsync(async (req, res, next) => {
  const pid = +req.body.id;
  delete req.body.id;
  const { value, error } = updatedProductSchema.validate(req.body);
  if (error) return next(new AppError(error));
  // IF USER SEND BRAND AND CATEGORY
  if (value.brandTitle) {
    let brand = await prisma.brand.findFirst({
      where: { name: value.brandTitle.toUpperCase() },
    });
    if (!brand)
      brand = await prisma.brand.create({
        data: { name: value.brandTitle.toUpperCase() },
      });
    delete value.brandTitle;
    value.brandId = brand.id;
  }
  if (value.categoryTitle) {
    let category = await prisma.category.findFirst({
      where: { name: value.categoryTitle.toUpperCase() },
    });
    if (!category)
      category = await prisma.category.create({
        data: { name: value.categoryTitle.toUpperCase() },
      });
    delete value.categoryTitle;
    value.categoryId = category.id;
  }
  const updatedProduct = await prisma.product.update({
    where: {
      id: pid,
    },
    data: { ...value, updatedAt: new Date() },
  });
  // IF THERE IS ANY FILE WITH BODY
  if (req.files.length !== 0) {
    await prisma.productImage.deleteMany({
      where: {
        productId: pid,
      },
    });

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
      images.push({ imageUrl: image, productId: pid });
    }

    //   CREATE PRODUCT IMAGE
    await prisma.productImage.createMany({
      data: images,
    });
  }
  res.json({ data: updatedProduct });
});

