import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";

export const createpost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!text && !img)
      return res.status(400).json({ error: "Post cannot be empty" });

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
  return res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this post" });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ error: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field should be filled" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post does not exist" });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.log("Error in comment conntroller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // Unlike the post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      return res.status(200).json({ message: "Unliked the post" });
    } else {
      // Like Post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      return res.status(200).json({ message: "Liked the post" });
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const allPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in allPost controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likedPost = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in likedPost controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req,res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
    if(!user){
      return res.status(404).json({error:"User Not Found"})
    }
    const following = user.following;
    const feedPosts = await Post.find({user:{$in:following}})
    .sort({createdAt : -1})
    .populate({
      path:"user",
      select:"-password"
    }).populate({
      path:"comments.user",
      select:"-password"
    })
    if (feedPosts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(feedPosts)
    
  } catch (error) {
    console.log("Error in getFollowing controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
  
}

export const getuserPosts = async(req,res)=>{
  try {
    const {username} = req.params
    const user = await User.findOne({username})
    if(!user) return res.status(404).json({error:"User not found"});

    const posts = await Post.find({user: user._id}).
    sort({createdAt : -1})
    .populate({
      path:"user",
      select:"-password"
    }).populate({
      path:"comments.user",
      select:"-password"
    })
    return res.status(200).json(posts)
  } catch (error) {
    console.log("Error in getuserPosts controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}