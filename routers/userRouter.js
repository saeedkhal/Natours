const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authenticationController');

const router = express.Router();

//authuntcation routers
router.post('/signUp', authController.signUp);
router.post('/logIn', authController.logIn);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);
//all router after that route will be protected
router.use(authController.protect);

router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

router.patch('/updateMe', userController.uploadPhoto, userController.updateMe);
router.get('/getMe', userController.getMe, userController.getOneUser);
router.delete('/deleteMe', userController.deleteMe);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllusers)
  .post(userController.creatUser);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
