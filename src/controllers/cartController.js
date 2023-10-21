const prisma = require("../models/prisma");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.fetchCart = catchAsync(async (req, res, next) => {
  const cart = await prisma.cart.findMany({
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
  const total = cart.reduce(
    (acc, cur) => acc + cur.quantity * Number(cur.product.price),
    0
  );
  res.json({ data: { total, cart } });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {

  const { productId, quantity } = req.query;
  const pid = +productId;

  let cart = await prisma.cart.findFirst({
    where: {
      userId: req.user.id,
      productId: pid,
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: req.user.id,
        productId: pid,
        quantity: quantity ? +quantity : 1,
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
  } else {
    cart = await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        quantity: {
          increment: quantity ? +quantity : 1,
        },
      },
    });
  }

  res.json({
    data: {
      cart,
    },
  });
});

exports.removeProductFromCart = catchAsync(async (req, res, next) => {

  const { productId } = req.query;
  const pid = Number(productId);
  let cart = await prisma.cart.findFirst({
    where: {
      userId: req.user.id,
      productId: pid,
    },
  });

  if (!cart)
    return next(
      new AppError(`There is no product with id ${pid} on your cart.`)
    );
  else if (cart.quantity <= 1) {
    return next(
      new AppError("Cannot deduct existing amount more than remaining amount.")
    );
  } else {
    cart = await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        quantity: {
          decrement: 1,
        },
      },
    });
  }

  res.json({
    data: {
      cart,
    },
  });
});

exports.deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const pid = Number(productId);
  let cart = await prisma.cart.findFirst({
    where: {
      userId: req.user.id,
      productId: pid,
    },
  });
  if (!cart) {
    return next(
      new AppError(`There is no product with id ${pid} on your cart.`)
    );
  } else {
    await prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });
    cart = null;
  }
  res.json({
    data: {
      cart,
    },
  });
});
