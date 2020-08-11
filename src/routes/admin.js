const express = require('express');
const admin = require('../controller/user');
const superUser = require('../middlewares/superuser');

const router = express.Router();

router.post('/signup', superUser.verifySuperuser, admin.signup);
router.post('/login', admin.login);
router.post('/suspend-user', superUser.verifySuperuser, admin.suspendUser);
router.post('/reactivate-user', superUser.verifySuperuser, admin.reactivateUser);
router.patch('/:userid/edit-user', superUser.verifySuperuser, admin.update_user);

module.exports = router;
