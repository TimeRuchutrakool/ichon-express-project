require('dotenv').config();
const express = require("express");
const cors = require('cors')
const userRouter = require('./routes/userRoute')
const app = express();

app.use(cors())
app.use(express.json())
app.use('/api/user',userRouter)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`SERVER ON PORT ${port}`));
