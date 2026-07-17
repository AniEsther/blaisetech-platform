// controllers/authController.js — register, login, "who am I", password reset,
// and the technician account-setup flow (admin invites, technician completes it).
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const { sendMail } = require('../utils/email');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName, email, phone, password: hashedPassword, role: 'customer',
    });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.accountSetupComplete) {
      return res.status(401).json({ message: 'Please finish setting up your account using the link sent to you before logging in.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'This account has been deactivated. Please contact the admin if you believe this is a mistake.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (requires login)
async function getMe(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been generated.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

    const emailSent = await sendMail({
      to: user.email,
      subject: 'Reset Your Password',
      heading: 'Reset Your Password',
      message: `Hi ${user.fullName},\nWe received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.\nIf you didn't request this, you can safely ignore this email — your password will stay the same.`,
      ctaLabel: 'Reset Password',
      ctaUrl: resetUrl,
    });

    const response = { message: 'If an account with that email exists, a reset link has been sent to it.' };
    if (!emailSent) response.devResetToken = rawToken;

    res.json(response);
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Your password has been reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/invite/:token — used by the "set up your account" page to
// check the token is valid before showing the form, and to greet the technician by name.
async function checkInviteToken(req, res, next) {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'This invite link is invalid or has expired.' });
    }

    res.json({ fullName: user.fullName, email: user.email });
  } catch (err) { next(err); }
}

// POST /api/auth/complete-invite — a technician (invited by admin, no password
// set yet) creates their own password and fills in their profile details.
async function completeInvite(req, res, next) {
  try {
    const { token, password, homeAddress, specialization, phone } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ where: { resetPasswordToken: hashedToken } });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'This invite link is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(password, 10);
    if (homeAddress) user.homeAddress = homeAddress;
    if (specialization) user.specialization = specialization;
    if (phone) user.phone = phone;
    user.accountSetupComplete = true;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const authToken = generateToken(user);
    res.json({
      message: 'Your account is ready. You can now log in.',
      token: authToken,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
}

module.exports = {
  register, login, getMe, forgotPassword, resetPassword,
  checkInviteToken, completeInvite,
};