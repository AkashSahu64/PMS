import crypto from 'crypto';

const otpStore = new Map(); // In production use Redis

export const generateOTP = (email) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 }); // 10 min
  return otp;
};

export const verifyOTP = (email, otp) => {
  const record = otpStore.get(email);
  if (!record || record.expires < Date.now()) return false;
  if (record.otp === otp) {
    otpStore.delete(email);
    return true;
  }
  return false;
};