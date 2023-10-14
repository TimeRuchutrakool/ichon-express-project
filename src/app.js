require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const AppError = require("./utils/appError");
const globaErrorHandler = require("./controllers/errorController");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRouter);
app.use("/api/product", productRouter);

app.all("*", (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
);

app.use(globaErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SERVER ON PORT ${port}`));
