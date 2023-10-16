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
  res.json({ data: { cart } });
});

exports.addProductToCart = catchAsync(async (req, res, next) => {
  // 1. check ก่อนว่ามี cart ไหนที่มร userId กับ productId ด้วยกันบ้างมั้ย
  // 2. ถ้าไม่มีก็สร้างขึ้นมาใหม่ quantity 1
  // 3. ถ้ามีแล้วก็ไปบวก quantity เดิมอีก 1
  const { productId, quantity } = req.params;
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
        quantity: +quantity,
      },
    });
  } else {
    cart = await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        quantity: {
          increment: +quantity,
        },
      },
    });
  }
  res.json({
    data: {
      updatedCart: cart,
    },
  });
});

exports.removeProductFromCart = catchAsync(async (req, res, next) => {
  // 1. check ก่อนว่ามี cart ไหนที่มร userId กับ productId ด้วยกันบ้างมั้ย
  // 2. ถ้ามีแล้วก็ไปลบ quantity เดิม 1 แต่ถ้า quantity = 0 ก็ให้ลบ cartId นี้ไปเลย
  const { productId, quantity } = req.params;
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
  if (cart.quantity <= +quantity) {
    await prisma.cart.delete({
      where: {
        id: cart.id,
      },
    });
    cart = null;
  } else {
    cart = await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        quantity: {
          decrement: +quantity,
        },
      },
    });
  }

  res.json({
    data: {
      updatedCart: cart,
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
