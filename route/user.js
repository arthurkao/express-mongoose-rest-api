const express = require('express');
const Boom = require('boom');
const router = express.Router();

const { UserController } = require('../controller');
//TODO /api doc (swagger)

// pass req, res objects on to controller function (returns promise)
// and handle error (rejected promise) by passing to next.
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
