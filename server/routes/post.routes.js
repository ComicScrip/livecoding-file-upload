const postsController = require('../controllers/post.controller.js');
const router = require('express').Router();

router.get('/', postsController.findAll);
router.post('/', postsController.create);

module.exports = router;
