const postsController = require('../controllers/post.controller.js');
const router = require('express').Router();
const handleImageUpload = require('../middlewares/handleImageUpload')

router.get('/', postsController.findAll);
router.post('/', handleImageUpload, postsController.create);

module.exports = router;
