// =========================================================================
// VALIDATION UTILITIES
// Standard Indian Mobile (10 digits starting with 6, 7, 8, or 9) & Email Normalization
// =========================================================================

export function validateIndianMobile(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      message: 'Mobile number is required and must be a valid 10-digit number.'
    };
  }

  let str = rawPhone.trim();

  // Strip international prefix if provided (+91 or 91 for 12-char string)
  if (str.startsWith('+91')) {
    str = str.slice(3).trim();
  } else if (str.startsWith('91') && str.length === 12) {
    str = str.slice(2).trim();
  }

  // Remove common separators like spaces and dashes
  str = str.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(str)) {
    return {
      isValid: false,
      message: 'Mobile number must contain digits only without letters or symbols.'
    };
  }

  if (str.length !== 10) {
    return {
      isValid: false,
      message: `Mobile number must be exactly 10 digits (received ${str.length} digits).`
    };
  }

  if (!/^[6-9]/.test(str)) {
    return {
      isValid: false,
      message: 'Mobile number must start with 6, 7, 8, or 9. Numbers starting with 1–5 are invalid.'
    };
  }

  return {
    isValid: true,
    digits: str,
    formatted: `+91 ${str}`
  };
}

export function validateAndNormalizeEmail(rawEmail) {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const clean = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(clean)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. name@domain.com).' };
  }

  return { isValid: true, email: clean };
}

