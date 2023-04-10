import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    caption: String,
    image_url: {
        public_id: String,
        url: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    CreatedAt: {
        type: Date,
        default: Date.now(),
    },
    likes: [

        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            comment: { type: String, required: true }
        }
    ]
});

export default mongoose.model("Post", PostSchema);