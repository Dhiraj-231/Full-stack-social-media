import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your name"]
    },
    avatar: {
        public_id: String,
        url: String,

    },
    email: {
        type: String,
        required: [true, "Please Enter an Email"],
        unique: [true, "Email already exists"]
    },
    password: {
        type: String, required: [true, "Please Enter a password"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        }
    ],
    follower: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    ResetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
});

export default mongoose.model('User', userSchema);