const OTP_TTL_MS = 2 * 60 * 1000;
const DEMO_OTP_CODE = '123456';

type OtpRecord = {
  contact: string;
  code: string;
  expiresAt: number;
};

const otpStore = new Map<string, OtpRecord>();

function generateToken() {
  return Math.random().toString(36).slice(2, 12);
}

export function requestOtp(contact: string) {
  const token = generateToken();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(token, {
    contact,
    code: DEMO_OTP_CODE,
    expiresAt,
  });

  return { token, expiresAt };
}

export function verifyOtp(token: string, code: string) {
  const record = otpStore.get(token);

  if (!record) {
    return { ok: false, error: 'missing' as const };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(token);
    return { ok: false, error: 'expired' as const };
  }

  if (record.code !== code) {
    return { ok: false, error: 'invalid' as const };
  }

  otpStore.delete(token);
  return { ok: true as const };
}

export const demoOtpCode = DEMO_OTP_CODE;
