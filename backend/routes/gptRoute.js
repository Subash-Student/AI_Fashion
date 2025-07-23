import express from "express";
import multer from "multer";
import { extractDressDetails } from "../controllers/gptController.js";
import authUser from "../middleware/auth.js";



const gptRouter = express.Router();
const upload = multer(); // Uses memory storage by default


gptRouter.post("/extract-dress-info", upload.array("images", 4), extractDressDetails);



export default gptRouter;