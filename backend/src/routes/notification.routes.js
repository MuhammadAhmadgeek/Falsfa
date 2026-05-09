const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const {
  getNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
} = require("../controllers/notification.controller");

router.use(protect);

router.get(  "/",             getNotifications);
router.get(  "/count",        getUnreadCount);
router.put(  "/read-all",     markAllRead);
router.put(  "/:id/read",     markOneRead);

module.exports = router;
