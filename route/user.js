const express = require('express');
const Boom = require('boom');
const router = express.Router();

const { UserController } = require('../controller');

//TODO /login /logout signup (JWT token)
//TODO /api doc (swagger)
//TODO crud route level test case (supertest)

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
router.post('/', wrap(UserController.create));

/*
 * PUT
 */
router.put('/:id', wrap(UserController.update));

/*
 * DELETE
 */
router.delete('/:id', wrap(UserController.remove));

module.exports = router;
