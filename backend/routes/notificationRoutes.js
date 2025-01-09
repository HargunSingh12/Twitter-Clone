import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { getAllNotifications,deleteNotifications } from '../controllers/notificationControllers.js'


const router = express.Router()

router.get('/',protectRoute,getAllNotifications)
router.delete('/',protectRoute,deleteNotifications)

export default router