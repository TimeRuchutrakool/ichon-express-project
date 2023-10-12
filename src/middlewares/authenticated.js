const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../models/prisma");
const jwt = require("jsonwebtoken");

module.exports = catchAsync(async (req, res, next) => {
  //TODO 1. Getting token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token)
    return next(
      new AppError("You are not logged in, Please log in first", 401)
    );

  //TODO 2. verify the token
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //TODO 3. check if user still exits
  const user = await prisma.user.findFirst({ where: { id: payload.userId } });
  if (!user) return next(new AppError("User does not exist"), 404);
  delete user.password;
  delete user.role;
  delete user.createdAt;
  req.user = user;
  next();
});
