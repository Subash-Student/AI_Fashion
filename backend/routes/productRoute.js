import express from 'express'
import { listProducts, addProduct, removeProduct, singleProduct, submitReview, handleWishlist, adminSingleProduct, updateProduct } from '../controllers/productController.js'
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const productRouter = express.Router();

productRouter.post('/add',adminAuth,multer().fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.post('/admin/single',authUser,adminSingleProduct);
productRouter.get('/list',listProducts)
productRouter.post("/wishlist/:isWishlist",authUser,handleWishlist)
productRouter.post("/review/add",authUser,submitReview)
productRouter.post("/update",authUser,multer().fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),updateProduct)

export default productRouter