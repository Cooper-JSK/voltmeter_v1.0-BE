// routes/sessions.js
const express = require('express');
const { createSession, startSession, stopSession, downloadSessionData, getAllSessions, getSession } = require('../controllers/sessionController');
const router = express.Router();

router.post('/', createSession);
router.get('/', getAllSessions);
router.get('/:sessionId', getSession);
router.post('/:sessionId/start', startSession);
router.post('/:sessionId/stop', stopSession);
router.get('/:sessionId/download', downloadSessionData);

module.exports = router;
