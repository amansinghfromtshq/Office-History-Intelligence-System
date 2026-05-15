const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const ctrl = require('../controllers/adminController');

const adminOnly = [authenticate, roleCheck('super_admin', 'office_admin')];

router.get('/users', ...adminOnly, ctrl.listUsers);
router.put('/users/:id', ...adminOnly, ctrl.updateUser);
router.get('/departments', authenticate, ctrl.listDepartments);
router.post('/departments', ...adminOnly, ctrl.createDepartment);
router.put('/departments/:id', ...adminOnly, ctrl.updateDepartment);
router.delete('/departments/:id', ...adminOnly, ctrl.deleteDepartment);
router.get('/audit-logs', ...adminOnly, ctrl.getAuditLogs);
router.get('/ai-monitoring', ...adminOnly, ctrl.getAIMonitoring);

module.exports = router;
