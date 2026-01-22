const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const EMAIL_MAX_LENGTH = 254;
const PHONE_MIN_LENGTH = 10;
const PHONE_MAX_LENGTH = 15;

export const OTP_LENGTH = 6;

type ContactValidation = {
  error: string | null;
  normalized: string;
};

export function validateContact(value: string): ContactValidation {
  const trimmed = value.trim();

  if (!trimmed) {
    return { error: 'Please enter your phone or email.', normalized: '' };
  }

  const looksLikeEmail = trimmed.includes('@') || /[a-zA-Z]/.test(trimmed);

  if (looksLikeEmail) {
    if (trimmed.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(trimmed)) {
      return { error: 'Enter a valid email address.', normalized: trimmed };
    }
    return { error: null, normalized: trimmed.toLowerCase() };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < PHONE_MIN_LENGTH || digits.length > PHONE_MAX_LENGTH) {
    return { error: 'Enter a valid phone number.', normalized: digits };
  }

  return { error: null, normalized: digits };
}

export function validateOtp(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Please enter the code we sent.';
  }

  if (!/^\d+$/.test(trimmed) || trimmed.length !== OTP_LENGTH) {
    return 'Enter the 6-digit code.';
  }

  return null;
}
