const { type } = require("os");
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
    include: {
      user: true,
      OrderItem: {
        include: {
          product: true,
        },
      },
    },
  });
  const data = orders.map((order) => {
    return {
      id: order.id,
      slipUrl: order.slipUrl,
      createdAt: order.createdAt,
      statusId: order.statusId,
      user: {
        id: order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        phone: order.user.phone,
        email: order.user.email,
        address: order.user.address,
      },
      products: order.OrderItem.map((product) => {
        return {
          id: product.id,
          quantity: product.quantity,
          name: product.product.name,
          price: product.product.price,
        };
      }),
      total: order.OrderItem.reduce((total, product) => {
        return total + Number(product.product.price);
      }, 0),
    };
  });
  res.json({ data: data });
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

exports.getOrderCount = catchAsync(async (req, res, next) => {
  let orders =
    await prisma.$queryRaw`SELECT CAST(created_at AS DATE) AS createdAt,COUNT(*) AS orderCount FROM orders GROUP BY CAST(created_at AS DATE)`;
  orders = orders.map((order) => {
    return {
      createdAt: order.createdAt,
      orderCount: Number(order.orderCount),
    };
  });
  const date = [];
  const count = [];
  orders.forEach((order) => {
    date.push(order.createdAt);
    count.push(order.orderCount);
  });
  res.json({ data: { date: date, count } });
});
