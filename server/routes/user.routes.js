const express = require("express");
const { protect } = require("../middlewares/protect");
const {
  register,
  login,
  logout,
  getMe
} = require("../controllers/auth.controller");

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.use(protect);

router.get('/me', getMe);
router.get('/logout', logout);

module.exports = router;