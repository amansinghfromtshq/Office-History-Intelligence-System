const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.get('/stats', authenticate, ctrl.getStats);
router.get('/charts', authenticate, ctrl.getChartData);
router.get('/activity', authenticate, ctrl.getRecentActivity);

module.exports = router;
