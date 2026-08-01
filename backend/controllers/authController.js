const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');
const { sendMail } = require('../utils/mailer');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const APP_DEEP_LINK = process.env.APP_DEEP_LINK || 'theiptv://auth';
const FRONTEND_DOWNLOAD_URL = process.env.FRONTEND_DOWNLOAD_URL || 'https://example.com/download-theiptv';

async function register(req, res) {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ error: 'username and email required' });

  // basic validation
  if (String(username).length < 3) return res.status(400).json({ error: 'username must be at least 3 characters' });
  if (!validator.isEmail(String(email))) return res.status(400).json({ error: 'invalid email address' });

  try {
    const existing = await User.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'User with this email already exists' });

    // create user with empty password_hash (magic link flows only)
    const user = await User.createUser({ username, email, password_hash: null });

    // create magic token (short-lived)
    const magicToken = jwt.sign({ email: user.email, purpose: 'magic' }, JWT_SECRET, { expiresIn: '24h' });

    // deep link that opens the app on devices; also provide HTTP fallback
    const deepLink = `${APP_DEEP_LINK}?token=${encodeURIComponent(magicToken)}`;
    const fallbackLink = `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/magic/verify?token=${encodeURIComponent(magicToken)}`;

    const subject = 'Your TheIPTV download & login link';
    const text = `Hello ${user.username},\n\nClick the link below to download/open TheIPTV. It will automatically log you in:\n\n${deepLink}\n\nIf that doesn't work, use this link in a browser:\n${fallbackLink}\n\nOr download app: ${FRONTEND_DOWNLOAD_URL}`;

    await sendMail({ to: user.email, subject, text, html: `<p>${text.replace(/\n/g,'<br/>')}</p>` });

    res.json({ ok: true, message: 'Registration successful, magic link sent to email' });
  } catch (err) {
    logger.error('register error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function resendMagic(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  if (!validator.isEmail(String(email))) return res.status(400).json({ error: 'invalid email address' });

  try {
    const user = await User.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'user not found' });

    const magicToken = jwt.sign({ email: user.email, purpose: 'magic' }, JWT_SECRET, { expiresIn: '24h' });
    const deepLink = `${APP_DEEP_LINK}?token=${encodeURIComponent(magicToken)}`;
    const fallbackLink = `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/magic/verify?token=${encodeURIComponent(magicToken)}`;

    const subject = 'Your TheIPTV login link';
    const text = `Hello ${user.username},\n\nUse this link to open TheIPTV and log in:\n\n${deepLink}\n\nFallback: ${fallbackLink}`;

    await sendMail({ to: user.email, subject, text, html: `<p>${text.replace(/\n/g,'<br/>')}</p>` });

    res.json({ ok: true, message: 'Magic link resent' });
  } catch (err) {
    logger.error('resendMagic error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function verifyMagic(req, res) {
  const token = req.query.token || req.params.token;
  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.purpose !== 'magic') return res.status(400).json({ error: 'invalid token' });

    const user = await User.getUserByEmail(payload.email);
    if (!user) return res.status(404).json({ error: 'user not found' });

    // issue auth JWT (longer lived)
    const authToken = jwt.sign({ sub: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // If request comes from browser (fallback), return JSON with token; otherwise redirect to deep link with token
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      // serve a small page that redirects to deep link (so clicking link in email in a mobile browser opens app)
      const redirectUrl = `${APP_DEEP_LINK}?auth=${encodeURIComponent(authToken)}`;
      return res.send(`<html><body><script>window.location='${redirectUrl}';</script><p>Opening app... If nothing happens, copy this code: ${authToken}</p></body></html>`);
    }

    res.json({ token: authToken });
  } catch (err) {
    logger.error('verifyMagic error', err);
    return res.status(400).json({ error: 'invalid or expired token' });
  }
}

module.exports = { register, resendMagic, verifyMagic };
