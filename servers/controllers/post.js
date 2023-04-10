import Post from "../models/Post.js";
import User from "../models/User.js";
export const Upload = async (req, res) => {
    try {
        const post = await new Post({
            caption: req.body.caption,
            image: {
                public_id: "req.body.public_id",
                url: "req.body.url",
            },
            owner: req.user._id
        });
        const user = await User.findById(req.user._id);
        await post.save();
        user.posts.push(post._id);
        await user.save();
        res.status(200).json({
            success: true,
            post,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const Delete = async (req, res) => {
    try {
        const post = await Post.findById({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            })
        }
        await post.deleteOne({ _id: post._id });
        const user = await User.findById({ _id: req.user._id });
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);

        await user.save();
        res.status(200).json({
            success: true,
            message: "Post deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const likeAndUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);

            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            });
        } else {
            post.likes.push(req.user._id);
            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Liked",
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getPostOfFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = await Post.find({ owner: req.user.following });
        res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const updateCaption = async (req, res) => {
    try {
        const post = await Post.findById({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (req.user._id.toString() !== post.owner._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You can upadate caption of your post only"
            });
        }
        await post.updateOne({
            caption: req.body.caption,
        })
        res.status(200).json({
            success: true,
            message: "Caption updated"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        let commentIndex = -1;

        // Checking if comment already exist
        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentIndex = index;
            }
        })

        if (commentIndex !== -1) {
            post.comments[commentIndex].comment = req.body.comment;
            await post.save();

            return res.status(200).json({
                success: true,
                message: "comment Updated"
            })
        } else {
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment
            });
            await post.save();
        }
        res.status(200).json({
            success: true,
            message: "Comment Added",
            post,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.owner.toString() === req.user._id.toString()) {
            console.log(req.body.commentId);
            if (req.body.commentId == undefined || req.body.commentId == "") {
                return res.status(400).json({
                    success: false,
                    message: "Comment id is required"
                })
            }
            post.comments.forEach((item, index) => {
                if (item._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1);
                }
            });
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Selected comment has deleted"
            })

        } else {
            post.comments.forEach((item, index) => {
                if (item.user.toString() === req.user._id.toString()) {
                    return post.comments.splice(index, 1);
                }
            });

            await post.save();

            res.status(200).json({
                success: true,
                message: "Your comment has deleted",
            })
        }
    } catch (error) {
        res.status(500).json({
            success: true,
            message: error.message
        })
    }
}