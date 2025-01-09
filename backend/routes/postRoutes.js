import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { createpost,deletePost,commentOnPost,likeUnlikePost,allPost,likedPost,getFollowingPosts,getuserPosts } from "../controllers/postControllers.js"

const router = express.Router()

router.get('/all',protectRoute,allPost)
router.get('/following',protectRoute,getFollowingPosts)
router.get('/likes/:id',protectRoute,likedPost)
router.get('/user/:username',protectRoute,getuserPosts)
router.post('/create',protectRoute,createpost)
router.post('/comment/:id',protectRoute,commentOnPost)
router.post('/like/:id',protectRoute,likeUnlikePost)
router.delete('/:id',protectRoute,deletePost)


export default router