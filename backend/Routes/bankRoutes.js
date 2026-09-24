const express = require('express');
const router = express.Router();
const { nearbyBanks } = require('../controllers/bankSearchControllers');

router.get('/nearby', nearbyBanks);

module.exports = router;
