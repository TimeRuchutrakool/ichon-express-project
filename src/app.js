require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const cartRouter = require("./routes/cartRoute");
const orderRouter = require("./routes/orderRoute");
const seedRouter = require("./routes/seedRoute");
const wishRouter = require("./routes/wishRoute");
const AppError = require("./utils/appError");
const globaErrorHandler = require("./controllers/errorController");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/wish", wishRouter);
app.use("/seed", seedRouter);

app.all("*", (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
);

app.use(globaErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SERVER ON PORT ${port}`));
