const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/', templateController.createTemplate);
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;
