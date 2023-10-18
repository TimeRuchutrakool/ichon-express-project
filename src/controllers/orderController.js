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
  });
  const orderedProductsToCreate = carts.map((cartItem) => {
    return {
      quantity: cartItem.quantity,
      productId: cartItem.productId,
      orderId: order.id,
    };
  });
  // UPDATE SALES
  for (const product of orderedProductsToCreate) {
    await prisma.sales.update({
      where: {
        productId: product.productId,
      },
      data: {
        salesAmount: {
          increment: product.quantity,
        },
      },
    });
  }

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

exports.getOrders = catchAsync(async (req, res, next) => {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      userId: req.user.id,
    },
    include: {
      OrderItem: {
        include: {
          product: {
            include: {
              ProductImage: { distinct: ["productId"] },
            },
          },
        },
      },
      status: true,
    },
  });

  res.json({ data: { orders } });
});

exports.getOrdersForAdmin = catchAsync(async (req, res, next) => {
  const { statusId } = req.query;
  const orders = await prisma.order.findMany({
    where: {
      statusId: +statusId,
    },
  });
  res.json({ data: orders });
});

exports.updateStatusOrder = catchAsync(async (req, res, next) => {
  const { statusId, orderId } = req.body;
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
  });
  if (!order) return next(new AppError(`Order No.${orderId} is not exists.`));
  const updatedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      statusId,
    },
  });
  res.json({ data: updatedOrder });
});
