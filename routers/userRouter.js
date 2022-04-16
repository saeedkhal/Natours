const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authenticationController');

const router = express.Router();

//authuntcation routers
router.post('/signUp', authController.signUp);
router.post('/logIn', authController.logIn);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);
router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

//user routers
router
  .route('/')
  .get(userController.getAllusers)
  .post(userController.creatUser);

router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadPhoto,
  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router
  .route('/:id')
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
