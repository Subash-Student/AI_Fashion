import express from 'express';
import { loginUser,registerUser,adminLogin, getUserData, editUserDetails, editUserAddressByPincode } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.get('/mydata',authUser,getUserData)
userRouter.post("/edit",authUser,editUserDetails)
userRouter.post("/edit-address", authUser, editUserAddressByPincode);

export default userRouter;