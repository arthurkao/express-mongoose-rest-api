const express = require('express');
const router = express.Router();
const userRouter = require('./UserRoutes');

router.use('/user', userRouter);
module.exports = router;