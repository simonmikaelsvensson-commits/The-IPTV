const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const ctrl = require('../controllers/authController');
const logger = require('../utils/logger');
const RateLimitLog = require('../models/rateLimitLog');

async function logRateLimit(event, req) {
  try {
    const meta = { ip: req.ip, path: req.originalUrl, time: new Date().toISOString() };
    logger.warn(`[rate-limit:${event}] ${JSON.stringify(meta)}`);
    // store to DB asynchronously
    RateLimitLog.insertRateLimitEvent({ event, ip: req.ip, path: req.originalUrl, meta }).catch(e => logger.error('rateLimitLog insert error', e));
  } catch (e) { logger.warn('rate-limit log error', e); }
}

// Rate limiters with logging handlers
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    logRateLimit('register.block', req);
    res.status(429).json({ error: 'Too many registration attempts, try again later.' });
  },
  onLimitReached: (req, res) => logRateLimit('register.reached', req)
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    logRateLimit('resend.block', req);
    res.status(429).json({ error: 'Too many resend attempts, try again later.' });
  },
  onLimitReached: (req, res) => logRateLimit('resend.reached', req)
});

// POST /auth/register -> { username, email }
router.post('/register', registerLimiter, ctrl.register);

// POST /auth/resend -> { email }
router.post('/resend', resendLimiter, ctrl.resendMagic);

// GET /auth/magic/verify?token=... or /auth/magic/:token
router.get('/magic/verify', ctrl.verifyMagic);
router.get('/magic/:token', ctrl.verifyMagic);

module.exports = router;
