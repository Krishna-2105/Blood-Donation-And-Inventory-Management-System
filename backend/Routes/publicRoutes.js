const express = require('express');
const router = express.Router();
const { getPublicStats } = require('../controllers/publicControllers');

router.get('/stats', getPublicStats);

module.exports = router;
