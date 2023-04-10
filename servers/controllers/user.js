import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import Post from "../models/Post.js";
import sendEmail from "../middlewares/sendEmail.js";
dotenv.config({ path: "../configs/config.env" })
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, msg: "User already exists" });
        user = new User({
            name,
            email,
            password,
            avatar: { public_id: "sample_id", url: "sampleurl" },
        });
        const data = await user.save();

        const payload = {
            _id: data._id,
            email: data.email,
        }
        const token = jsonwebtoken.sign(payload, process.env.JWT_SCREAT);
        res.status(200).cookie("token", token, { expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), httpOnly: true }).json({
            success: true,
            user,
            token,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "user not exist",
            })
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                msg: "Worng email or password",
            });
        }
        const payload = {
            _id: user._id,
            email: user.email,
        }
        const token = jsonwebtoken.sign(payload, process.env.JWT_SCREAT);
        res.status(200).cookie("token", token, { expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), httpOnly: true }).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        res.status(408).json({
            success: false,
            error: error.message,
        })
    }
}

export const followuser = async (req, res) => {
    try {
        const userToFollow = await User.findById({ _id: req.params.id });
        const loggedInUser = await User.findById({ _id: req.user._id });

        if (!userToFollow) {
            return res.status(404).json({
                success: true,
                message: "User not exist"
            })
        }
        if (userToFollow._id.toString() === loggedInUser._id.toString()) {
            return res.status(404).json({
                success: false,
                message: "You Cannot follow your self"
            })
        }


        if (loggedInUser.following.includes(userToFollow._id)) {
            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);

            loggedInUser.following.splice(indexFollowing, 1);


            const indexFollower = userToFollow.follower.indexOf(loggedInUser._id);

            userToFollow.follower.splice(indexFollower, 1);

            await loggedInUser.save();
            await userToFollow.save();
            return res.status(200).json({
                success: true,
                message: "User Unfollowed"
            });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.follower.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "User followed"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            success: true,
            message: "Logout successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const updatePasssword = async (req, res) => {
    try {

        const user = await User.findById(req.user._id).select("+password");
        const { oldPassword, newPassword } = req.body;
        if (!newPassword || !oldPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new Password",
            })
        }
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
            return res.status(204).json({
                success: false,
                message: "Wrong Password"
            });
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        await user.updateOne({
            password: hashPassword,
        });

        res.status(200).json({
            success: true,
            message: "Password Updated",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Please provide name and email or one"
            })
        }

        await user.updateOne({
            name,
            email
        });

        res.status(200).json({
            success: true,
            message: "profile updated"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const deleteProfile = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.user._id });
        const posts = user.posts;
        const followers = user.follower;
        const userId = user._id;
        const following = user.following;
        await user.deleteOne();

        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })

        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.deleteOne();
        }

        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);

            await follower.save();
        }

        for (let i = 0; i < following.length; i++) {
            const followings = await User.findById(following[i]);

            const index = followings.follower.indexOf(userId);
            followings.follower.splice(index, 1);

            await followings.save();
        }
        res.status(200).json({
            success: true,
            message: "Profile deleted"
        })
    } catch (error) {
        res.status(200).json({
            success: false,
            message: error.message
        })
    }
}

export const myProfileDetail = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.user._id }).populate("posts");
        res.status(200).json({
            success: true,
            message: "Your profile Details",
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getProfileDetail = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.params.id }).populate("posts");
        res.status(200).json({
            success: true,
            message: "Your profile Details",
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getAllUser = async (req, res) => {
    try {
        const user = await User.find({});

        res.status(200).json({
            success: true,
            message: "Query completed",
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const getResetPasswordToken = () => {
            const resetToken = crypto.randomBytes(20).toString("hex");
            user.ResetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
            user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
            return resetToken;
        }
        const resetPasswordToken = getResetPasswordToken();
        await user.save();
        const resetUrl = ` ${req.protocol}://${req.get("host")}/user/resetPassword/${resetPasswordToken}`;

        const message = ` Reset your password by clicking on the link below:\n\n${resetUrl}`;
        console.log("Hiii2");

        try {
            await sendEmail({ email: user.email, subject: "Reset password", message });

            res.status(200).json({
                success: true,
                message: ` Email sent to ${user.email}`
            })
        } catch (error) {
            user.ResetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(500).json({
                success: false,
                message: error.message
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({ ResetPasswordToken: resetPasswordToken })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token is invalid"
            });
        }
        const newPassword = req.body.password;
        const hashpassword = await bcrypt.hash(newPassword, 10);
        user.password = hashpassword;
        user.ResetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
