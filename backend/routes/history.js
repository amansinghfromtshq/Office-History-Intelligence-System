const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const ctrl = require('../controllers/historyController');

router.post('/', authenticate, roleCheck('super_admin','office_admin','dept_officer','employee'), ctrl.createEntry);
router.get('/', authenticate, ctrl.listEntries);
router.get('/timeline', authenticate, ctrl.getTimeline);
router.get('/:id', authenticate, ctrl.getEntry);
router.put('/:id', authenticate, roleCheck('super_admin','office_admin','dept_officer'), ctrl.updateEntry);
router.delete('/:id', authenticate, roleCheck('super_admin','office_admin'), ctrl.deleteEntry);

module.exports = router;
