// routes/dataRoutes.js
const express = require('express');
const { getData, setInterval } = require('../controllers/dataController');
const router = express.Router();

router.get('/data/:sessionId', getData);
router.post('/interval/:sessionId', setInterval);

module.exports = router;
