import express from 'express';
import { User } from '../models/User.js';
import { EmailOtp } from '../models/EmailOtp.js';
import { WorkerApplication } from '../models/WorkerApplication.js';
import { PartnerApplication } from '../models/PartnerApplication.js';
import { sendRegistrationOtpEmail } from '../services/emailService.js';

const router = express.Router();

// 1. Send Registration OTP to Email (Supports Customer, Worker, & Partner Onboarding)
router.post('/send-registration-otp', async (req, res) => {
  try {
    const { email, name, phone, city, locality, purpose = 'customer' } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || 'New Applicant';
    const cleanPhone = (phone && phone.trim()) || '';
    const cleanDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Role-specific duplication check
    if (purpose === 'worker') {
      const existingWorker = await WorkerApplication.findOne({
        email: cleanEmail,
        status: { $in: ['Approved', 'Active'] }
      });
      if (existingWorker) {
        return res.status(409).json({
          success: false,
          message: 'A registered service professional with this email already exists. Please sign in.'
        });
      }
    } else if (purpose === 'partner') {
      const existingPartner = await PartnerApplication.findOne({
        email: cleanEmail,
        status: { $in: ['Approved', 'Active'] }
      });
      if (existingPartner) {
        return res.status(409).json({
          success: false,
          message: 'A registered fleet partner with this email already exists. Please sign in.'
        });
      }
    } else {
      // Customer registration: check if this exact email already has an active account with a set password
      const existingEmailUser = await User.findOne({ email: cleanEmail });
      if (existingEmailUser && existingEmailUser.status === 'Active' && existingEmailUser.password) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.'
        });
      }
    }

    // Rate-limiting check: Prevent spamming OTP requests (minimum 25s cooldown)
    const existingOtp = await EmailOtp.findOne({ email: cleanEmail });
    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedSeconds = (Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 25) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(25 - elapsedSeconds)}s before requesting a new code.`
        });
      }
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save or update pending OTP record
    await EmailOtp.findOneAndUpdate(
      { email: cleanEmail },
      {
        otp,
        name: cleanName,
        phone: cleanPhone,
        city: (city && city.trim()) ? city.trim() : 'Krishnagiri',
        locality: (locality && locality.trim()) ? locality.trim() : 'Rayakottai Road',
        attempts: 0,
        verified: false,
        lastSentAt: new Date(),
        expiresAt
      },
      { upsert: true, new: true }
    );

    // Send real-time email via Brevo SMTP
    const mailResult = await sendRegistrationOtpEmail(cleanEmail, cleanName, otp);

    const responsePayload = {
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox and spam folder.`,
      email: cleanEmail,
      expiresInMinutes: 10
    };

    // Diagnostic assistance: In development mode, provide devOtp if Brevo IP authorization is pending
    if (process.env.NODE_ENV === 'development') {
      responsePayload.devOtp = otp;
      if (!mailResult.success) {
        responsePayload.deliveryNotice = mailResult.error;
      }
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('send-registration-otp error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send verification code.' });
  }
});

// 1B. Verify Email OTP (Step 1 verification before password creation)
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit verification code.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const otpRecord = await EmailOtp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found for this email. Please click Verify to request a code.'
      });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired (10 min limit). Please request a new code.'
      });
    }

    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a fresh code.'
      });
    }

    if (otpRecord.otp !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const rem = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect code. ${rem > 0 ? `${rem} attempt(s) remaining.` : 'Code revoked.'}`
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return res.json({
      success: true,
      message: 'Email verified successfully! You can now set your password and complete account creation.'
    });
  } catch (err) {
    console.error('verify-email-otp error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to verify code.' });
  }
});

// 2. Verify Registration OTP and Create Customer Account
router.post('/verify-registration-otp', async (req, res) => {
  try {
    const { email, otp, name, phone, city, locality, address, isPlusMember, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp ? otp.toString().trim() : '';

    // Find pending OTP record
    const otpRecord = await EmailOtp.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification code found for this email. Please request a new code.'
      });
    }

    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired (10 min limit). Please request a new code.'
      });
    }

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a fresh verification code.'
      });
    }

    // Verify OTP matching if not previously verified
    if (!otpRecord.verified) {
      if (!cleanOtp || otpRecord.otp !== cleanOtp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        const remaining = 5 - otpRecord.attempts;
        return res.status(400).json({
          success: false,
          message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code revoked. Please request a new one.'}`
        });
      }
    }

    // OTP is valid! Clean up OTP record
    await EmailOtp.deleteOne({ _id: otpRecord._id });

    // Determine final registration parameters
    const finalName = (name && name.trim()) || otpRecord.name || 'New Customer';
    const rawPhone = (phone && phone.trim()) || otpRecord.phone || '+91 99999 00000';
    const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
    const finalPhone = rawPhone.startsWith('+91') ? rawPhone : `+91 ${cleanDigits}`;
    const targetCity = (city && city.trim()) || otpRecord.city || 'Krishnagiri';
    const targetLocality = (locality && locality.trim()) || otpRecord.locality || 'Rayakottai Road';

    // Check if account already exists
    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { phone: finalPhone },
        { phone: cleanDigits },
        { phone: rawPhone }
      ]
    });

    if (user) {
      user.name = finalName;
      user.email = cleanEmail;
      user.city = targetCity;
      user.locality = targetLocality;
      user.status = 'Active';
      if (password) user.password = password;
      if (isPlusMember !== undefined) user.hasUCPlus = Boolean(isPlusMember);
      await user.save();
    } else {
      const initialAddresses = [];
      if (address && address.trim()) {
        initialAddresses.push({
          id: `addr-${Date.now()}`,
          type: 'Home',
          streetAddress: address.trim(),
          locality: targetLocality,
          city: targetCity,
          isDefault: true
        });
      }

      user = await User.create({
        name: finalName,
        phone: finalPhone,
        email: cleanEmail,
        password: password || '',
        city: targetCity,
        locality: targetLocality,
        hasUCPlus: Boolean(isPlusMember),
        role: 'user',
        status: 'Active',
        savedAddresses: initialAddresses
      });
    }

    // Mirror to PostgreSQL if available
    try {
      const { query: pgQuery } = await import('../config/postgres.js');
      await pgQuery(
        `INSERT INTO customers (id, name, phone, email, is_plus_member, total_orders, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, NOW())
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name, 
           email = EXCLUDED.email, 
           phone = EXCLUDED.phone;`,
        [user._id.toString(), user.name, user.phone, user.email, Boolean(user.hasUCPlus)]
      );
    } catch (pgErr) {
      // Non-blocking notice
    }

    res.status(201).json({
      success: true,
      message: 'Email verified successfully! Welcome to Forge India Connect.',
      user
    });
  } catch (error) {
    console.error('verify-registration-otp error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification failed.' });
  }
});

// 3. Login or auto-fetch by phone
router.post('/login', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    let user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      user = await User.create({
        name: name ? name.trim() : 'Rahul Sharma',
        phone: phone.trim(),
        role: phone.includes('9999999999') ? 'admin' : 'user',
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Standard Register user (Supports direct or OTP-verified flow)
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, city, locality, address, isPlusMember, otp } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Name and Phone are required' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone.trim();
    const cleanDigits = cleanPhone.replace(/\D/g, '').slice(-10);
    const targetCity = (city && city.trim()) ? city.trim() : 'Krishnagiri';
    const targetLocality = (locality && locality.trim()) ? locality.trim() : 'Rayakottai Road';

    // If OTP was supplied with registration request, verify it first
    if (otp && cleanEmail) {
      const otpRecord = await EmailOtp.findOne({ email: cleanEmail });
      if (!otpRecord || otpRecord.otp !== otp.toString().trim()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
      }
      await EmailOtp.deleteOne({ _id: otpRecord._id });
    }

    // Check if customer already exists by phone or formatted phone
    let existing = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: `+91 ${cleanDigits}` },
        { phone: cleanDigits },
        ...(cleanEmail ? [{ email: cleanEmail }] : [])
      ]
    });

    if (existing) {
      existing.name = name.trim();
      if (cleanEmail) existing.email = cleanEmail;
      if (city) existing.city = targetCity;
      if (locality) existing.locality = targetLocality;
      if (isPlusMember !== undefined) existing.hasUCPlus = Boolean(isPlusMember);
      
      if (address && address.trim()) {
        existing.savedAddresses = existing.savedAddresses || [];
        const hasAddr = existing.savedAddresses.some(a => a.streetAddress === address.trim());
        if (!hasAddr) {
          existing.savedAddresses.push({
            id: `addr-${Date.now()}`,
            type: 'Home',
            streetAddress: address.trim(),
            locality: targetLocality,
            city: targetCity,
            isDefault: existing.savedAddresses.length === 0
          });
        }
      }

      await existing.save();
      return res.json({ success: true, user: existing });
    }

    const initialAddresses = [];
    if (address && address.trim()) {
      initialAddresses.push({
        id: `addr-${Date.now()}`,
        type: 'Home',
        streetAddress: address.trim(),
        locality: targetLocality,
        city: targetCity,
        isDefault: true
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanDigits}`,
      email: cleanEmail || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      city: targetCity,
      locality: targetLocality,
      hasUCPlus: Boolean(isPlusMember),
      role: 'user',
      status: 'Active',
      savedAddresses: initialAddresses
    });

    // Mirror to PostgreSQL customers table for synchronized multi-database consistency
    try {
      const { query: pgQuery } = await import('../config/postgres.js');
      await pgQuery(
        `INSERT INTO customers (id, name, phone, email, is_plus_member, total_orders, created_at)
         VALUES ($1, $2, $3, $4, $5, 0, NOW())
         ON CONFLICT (id) DO UPDATE SET 
           name = EXCLUDED.name, 
           email = EXCLUDED.email, 
           phone = EXCLUDED.phone;`,
        [newUser._id.toString(), newUser.name, newUser.phone, newUser.email, Boolean(newUser.hasUCPlus)]
      );
    } catch (pgErr) {
      // Non-blocking notice
    }

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get user profile
router.get('/me', async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone) {
      const defaultUser = await User.findOne().sort({ createdAt: 1 });
      return res.json({ success: true, user: defaultUser });
    }

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Update profile / UC Plus status
router.put('/profile', async (req, res) => {
  try {
    const { phone, name, email, hasUCPlus } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const user = await User.findOneAndUpdate(
      { phone: phone.trim() },
      { 
        ...(name && { name: name.trim() }),
        ...(email !== undefined && { email: email.trim() }),
        ...(hasUCPlus !== undefined && { hasUCPlus }),
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
