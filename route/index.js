const express = require('express');
const Boom = require('boom');

const { AuthController } = require('../controller');

//express router instance to define all /api/* routes
const router = express.Router();
/**
 * middleware to filter out requests other than 'application/json'
 */
router.use((req, res, next) => {
  const contentType = req.headers['content-type'];
  return contentType != 'application/json'?
    next(Boom.unsupportedMediaType("Expect application/json")): next();
});

// ***** register /api routes here *****
// /api/* routes
/**
 * @swagger
 *
 * /api/login:
 *   post:
 *     summary: login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             username:
 *               type: string
 *               required: true
 *             password:
 *               type: string
 *               required: true
 *           example:
 *             username: testuser
 *             password: testpassword
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: token created
 *         content:
 *           application/jason:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: jwt token for protected routes
 *       422:
 *         description: Bad request. username / password must present
 *       401:
 *         description: Authorization information is invalid
 *       5XX:
 *         description: Unexpected Error
 */
router.post('/login', (req, res, next) => {
  AuthController.authenticate(req, res).catch(next);
});
// /api/user/* routes
router.use('/user', require('./user'));


// all other untended /api/ routes
router.all('*', (req, res) => (res.status(404).json({
  'message': 'API Not Found'
})));

module.exports = router;
