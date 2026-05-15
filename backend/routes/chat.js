const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const ctrl = require('../controllers/chatController');

router.post('/', authenticate, aiLimiter, ctrl.chat);
router.get('/history', authenticate, ctrl.getChatHistory);
router.get('/suggestions', authenticate, ctrl.getSuggestions);

module.exports = router;
