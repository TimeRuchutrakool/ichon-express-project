const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        Math.round(Math.random()) +
        1_000_000 +
        "-" +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;


// 1.สร้าง product ก่อน + insert into product table
// 2.upload file รูปภาพ เอา url มา
// 3.insert into images table แล้วก็ให้อิง FK ที่เป็น productId