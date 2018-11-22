const express = require('express');
const Boom = require('boom');
const jwt = require('express-jwt');
const router = express.Router();

const { UserController } = require('../controller');

const authMiddleware = jwt({ secret: process.env.JWT_SECRET });

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

/*
 * GET
 */
router.get('/', wrap(UserController.list));

/*
 * GET
 */
router.get('/:id', wrap(UserController.show));

/*
 * POST
 */
router.post('/', authMiddleware, wrap(UserController.create));

/*
 * PUT
 */
router.put('/:id', authMiddleware, wrap(UserController.update));

/*
 * DELETE
 */
router.delete('/:id', authMiddleware, wrap(UserController.remove));

module.exports = router;
