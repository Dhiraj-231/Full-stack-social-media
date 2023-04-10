import express from "express";
import { Delete, Upload, commentOnPost, deleteComment, getPostOfFollowing, likeAndUnlikePost, updateCaption } from "../controllers/post.js";
import { isAuth } from "../middlewares/auth.js";
const router = express.Router();

router.post("/upload", isAuth, Upload);
router.get("/likeUnlike/:id", isAuth, likeAndUnlikePost);
router.delete("/delete/:id", isAuth, Delete);
router.get("/followedPost", isAuth, getPostOfFollowing);
router.patch("/updateCaption/:id", isAuth, updateCaption);
router.put("/comment/:id", isAuth, commentOnPost);
router.delete("/deleteComment/:id", isAuth, deleteComment);

export default router;