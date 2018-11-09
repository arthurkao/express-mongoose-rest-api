const express = require('express');
const router = express.Router();
/**
 * express router instance to define all /api/* routes
 */
router.use('/user', require('./user'));
router.all('*', (req, res) => (res.status(404).json({
  'message': 'API Not Found'
})));

module.exports = router;
