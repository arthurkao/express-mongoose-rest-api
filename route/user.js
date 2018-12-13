const express = require('express');
const router = express.Router();

const { UserController } = require('../controller');
const jwtAuth = require('./middleware/jwtAuth');

/**
 * Wrap a controller function that takes req, res and returns a promise
 * returns a standard express route handler that handles error (rejected promise)
 * by passing to next. resolved promise is dropped.
 *
 * @param ctrFn
 * @returns {Function}
 */
function wrap(ctrFn) {
  return (req, res, next) => {
    ctrFn(req, res).catch(next);
  };
}

/**
 * @swagger
 *
 * components:
 *   parameters:
 *     userIdParam:
 *       name: id
 *       in: path
 *       description: User id
 *       required: true
 *       schema:
 *         type: string
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Access token is missing or token is invalid
 *     ResourceNotFoundError:
 *       description: Requested resource is not found
 *     BadDataError:
 *       description: Input parameter(s) is invalid
 *     InternalServerError:
 *       description: Unexpected internal server error
 */

/**
 * @swagger
 *
 * /user:
 *   get:
 *     summary: Get All Users
 *     tags:
 *       - user
 *     parameters:
 *       - in: query
 *         name: sort
 *         style: deepObject
 *         schema:
 *           type: object
 *         example:
 *           username: ASC
 *           email: ASC
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         example: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 10
 *     responses:
 *       200:
 *         description: array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#components/schemas/User'
 *       5XX:
 *         $ref: '#components/responses/InternalServerError'
 *   post:
 *     summary: Create One User
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/User'
 *     responses:
 *       201:
 *         description: created user
 *         content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/User'
 *       401:
 *         $ref: '#components/responses/UnauthorizedError'
 */
router.get('/', wrap(UserController.list));
router.post('/', jwtAuth, wrap(UserController.create));

/**
 * @swagger
 *
 * /user/{id}:
 *   summary: Represents a User
 *   description: An individual user in the system. Each user is identified by a id
 *   parameters:
 *     - $ref: '#components/parameters/userIdParam'
 *   get:
 *     summary: Get One User
 *     tags:
 *       - user
 *     responses:
 *       200:
 *         description: Retrieved User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/User'
 *       404:
 *         $ref: '#components/responses/ResourceNotFoundError'
 *       422:
 *         $ref: '#components/responses/BadDataError'
 *   put:
 *     summary: Update One User
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#components/schemas/User'
 *     responses:
 *       200:
 *         description: Modified User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#components/schemas/User'
 *       404:
 *         $ref: '#components/responses/ResourceNotFoundError'
 *       422:
 *         $ref: '#components/responses/BadDataError'
 *       5XX:
 *         $ref: '#components/responses/InternalServerError'
 *   delete:
 *     summary: Delete One User
 *     tags:
 *       - user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted
 *       422:
 *         $ref: '#components/responses/BadDataError'
 *       5XX:
 *         $ref: '#components/responses/InternalServerError' */
router.get('/:id', wrap(UserController.show));
router.put('/:id', jwtAuth, wrap(UserController.update));
router.delete('/:id', jwtAuth, wrap(UserController.remove));

module.exports = router;
