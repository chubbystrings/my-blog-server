const express = require('express');
const articles = require('../controller/articles');
const adminUser = require('../middlewares/admin');

const router = express.Router();

router.post('/', adminUser.verifyAdminUser, articles.createPost);
router.get('/', articles.getAll);
router.get('/author', adminUser.verifyAdminUser, articles.get_article_by_author);
router.get('/:articleid', articles.get_article_by_id);
router.patch('/:articleid', adminUser.verifyAdminUser, articles.update_one);
router.delete('/:articleid', adminUser.verifyAdminUser, articles.delete_one);

module.exports = router;
