import User from "../models/User.js";
import jwt from "jsonwebtoken";
export const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "please login first"
            })
        }
        const decode = await jwt.verify(token, process.env.JWT_SCREAT);
        req.user = await User.findOne({ _id: decode._id });
        next();
    } catch (error) {
        res.status(500).json({
            msg: error.message,
        })
    }
}