import express from 'express';
import { loginUser,registerUser,adminLogin, getUserData, editUserDetails, editUserAddressByPincode, resetPassword } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.get('/mydata',authUser,getUserData)
userRouter.post("/edit",authUser,editUserDetails)
userRouter.post("/reset-password",resetPassword)
userRouter.post("/edit-address", authUser, editUserAddressByPincode);

export default userRouter;