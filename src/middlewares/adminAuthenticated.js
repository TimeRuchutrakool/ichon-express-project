const AppError = require("../utils/appError");

module.exports = (req, res, next) => {
  if (req.user.role !== "ADMIN")
    return next(new AppError("Only admin can manipulate products"));
  next();
};
