const express = require('express');
const router = express.Router();
const { getPublicStats, getPublicBanks } = require('../controllers/publicControllers');
const { nearbyBanks } = require('../controllers/bankSearchControllers');

router.get('/stats', getPublicStats);
router.get('/banks', getPublicBanks);
router.get('/banks/nearby', nearbyBanks);

module.exports = router;
