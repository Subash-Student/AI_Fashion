import express from "express";
import multer from "multer";
import { extractDressDetails } from "../controllers/gptController.js";
import authUser from "../middleware/auth.js";



const gptRouter = express.Router();


gptRouter.post("/extract-dress-info", multer().array("images", 4), extractDressDetails);



export default gptRouter;