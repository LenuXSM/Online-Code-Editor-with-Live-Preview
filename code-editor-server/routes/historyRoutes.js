const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

router.get('/projects/:projectId/history', historyController.getProjectHistory);
router.post('/projects/:projectId/versions', historyController.saveVersion);
router.post('/projects/:projectId/versions/:versionId/restore', historyController.restoreVersion);

module.exports = router;
