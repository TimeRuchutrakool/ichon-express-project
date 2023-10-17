const prisma = require("../models/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishes = await prisma.wishItem.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      product: {
        include: {
          ProductImage: {
            distinct: ["productId"],
          },
        },
      },
    },
  });
  res.json({ data: { wishes } });
});

exports.addWishItem = catchAsync(async (req, res, next) => {
  const { productId } = req.query;
  let wishes = await prisma.wishItem.findFirst({
    where: {
      userId: req.user.id,
      productId: +productId,
    },
  });
  if (wishes)
    return next(new AppError(`product ${productId} is already in wishlist.`));
  wishes = await prisma.wishItem.create({
    data: {
      userId: req.user.id,
      productId: +productId,
    },
  });

  res.json({ data: { wishes } });
});
exports.removeWishItem = catchAsync(async (req, res, next) => {
  const { productId } = req.query;
  let wishes = await prisma.wishItem.findFirst({
    where: {
      userId: req.user.id,
      productId: +productId,
    },
  });
  if (!wishes)
    return next(
      new AppError(
        `product ${productId} is not in the wishlist at first place.`
      )
    );
  await prisma.wishItem.deleteMany({
    where: { userId: req.user.id, productId: +productId },
  });
  wishes = null;
  res.json({ data: { wishes } });
});
