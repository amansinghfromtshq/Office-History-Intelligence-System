const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const ctrl = require('../controllers/documentController');

router.post('/upload', authenticate, roleCheck('super_admin','office_admin','dept_officer','employee'), ctrl.uploadMiddleware, ctrl.uploadDocument);
router.get('/', authenticate, ctrl.listDocuments);
router.get('/categories', authenticate, ctrl.getCategories);
router.get('/:id', authenticate, ctrl.getDocument);
router.delete('/:id', authenticate, roleCheck('super_admin','office_admin'), ctrl.deleteDocument);

module.exports = router;
