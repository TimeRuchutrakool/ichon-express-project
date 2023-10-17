const prisma = require("../models/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { upload } = require("../utils/cloudinaryServices");
const fs = require("fs/promises");

exports.createOrder = catchAsync(async (req, res, next) => {
  // UPLOAD SLIP IMAGE
  if (!req.file)
    return next(new AppError("Slip image is required to create order."));
  const path = req.file.path;
  const url = await upload(path);
  fs.unlink(path);
  // CREATE ORDER
  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      statusId: 1,
      slipUrl: url,
    },
  });

  //   GET CART
  const carts = await prisma.cart.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      quantity: true,
      productId: true,
    },
  });
  const orderedProductsToCreate = carts.map((cartItem) => {
    return { ...cartItem, orderId: order.id };
  });

  // CREATE ORDER ITEM
  const orderItems = await prisma.orderItem.createMany({
    data: orderedProductsToCreate,
  });

  // DELETE CART
  await prisma.cart.deleteMany({
    where: {
      userId: req.user.id,
    },
  });
  res.json({ data: orderItems });
});
