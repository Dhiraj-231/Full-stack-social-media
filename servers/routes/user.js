import express from "express";
import { register, login, followuser, logout, updatePasssword, updateProfile, deleteProfile, myProfileDetail, getProfileDetail, getAllUser, forgotPassword, resetPassword } from "../controllers/user.js";
import { isAuth } from "../middlewares/auth.js";
const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.get("/logout", logout);
router.get("/follow/:id", isAuth, followuser);
router.patch("/updatePassword", isAuth, updatePasssword);
router.patch("/updateProfile", isAuth, updateProfile);
router.delete("/deleteProfile/me", isAuth, deleteProfile);
router.get("/profileDetail/me", isAuth, myProfileDetail);
router.get("/ProfileDetail/:id", isAuth, getProfileDetail);
router.get("/getAllDetail", isAuth, getAllUser);
router.get("/getAllDetail", isAuth, getAllUser);
router.post("/forget/password", isAuth, forgotPassword);
router.put("/resetPassword/:token", isAuth, resetPassword);

export default router;