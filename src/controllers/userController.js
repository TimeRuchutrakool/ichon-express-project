const prisma = require("../models/prisma");
const catchAsync = require("../utils/catchAsync");

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({ data: req.user });
});

exports.editUser = catchAsync(async (req, res, next) => {
  const toUpdateInfo = req.body;
  const user = await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: toUpdateInfo,
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      address: true,
    },
  });

  res.json({
    data: { user },
  });
});
