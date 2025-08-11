/**
 * Input validation and restriction utilities
 * Provides consistent validation across all form inputs
 */

export interface InputValidationOptions {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  required?: boolean;
  preventOverflow?: boolean;
  sanitize?: boolean;
  type?: 'text' | 'email' | 'url' | 'number' | 'decimal' | 'publickey';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Validates input based on type and options
 */
export function validateInput(value: string, options: InputValidationOptions = {}): ValidationResult {
  const {
    maxLength = 1000,
    minLength = 0,
    pattern,
    required = false,
    sanitize = true,
    type = 'text'
  } = options;

  let processedValue = value;

  // Basic required check
  if (required && (!processedValue || processedValue.trim().length === 0)) {
    return {
      isValid: false,
      error: 'This field is required'
    };
  }

  // Skip validation for empty optional fields
  if (!required && (!processedValue || processedValue.trim().length === 0)) {
    return {
      isValid: true,
      sanitizedValue: ''
    };
  }

  // Sanitize input if requested
  if (sanitize) {
    processedValue = sanitizeInput(processedValue);
  }

  // Length validation
  if (processedValue.length < minLength) {
    return {
      isValid: false,
      error: `Must be at least ${minLength} characters long`
    };
  }

  if (processedValue.length > maxLength) {
    return {
      isValid: false,
      error: `Must be no more than ${maxLength} characters long`
    };
  }

  // Type-specific validation
  const typeValidation = validateByType(processedValue, type);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Pattern validation
  if (pattern && !pattern.test(processedValue)) {
    return {
      isValid: false,
      error: 'Invalid format'
    };
  }

  return {
    isValid: true,
    sanitizedValue: processedValue
  };
}

/**
 * Type-specific validation
 */
function validateByType(value: string, type: string): ValidationResult {
  switch (type) {
    case 'email':
      return validateEmail(value);
    case 'url':
      return validateUrl(value);
    case 'number':
      return validateNumber(value);
    case 'decimal':
      return validateDecimal(value);
    case 'publickey':
      return validatePublicKey(value);
    default:
      return { isValid: true };
  }
}

/**
 * Email validation
 */
function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  return { isValid: true };
}

/**
 * URL validation
 */
function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        isValid: false,
        error: 'URL must start with http:// or https://'
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid URL'
    };
  }
}

/**
 * Number validation (integers only)
 */
function validateNumber(value: string): ValidationResult {
  const num = parseInt(value, 10);
  if (isNaN(num) || num.toString() !== value) {
    return {
      isValid: false,
      error: 'Please enter a valid number'
    };
  }
  
  // Additional safety checks for numeric values
  if (!isFinite(num)) {
    return {
      isValid: false,
      error: 'Number must be finite'
    };
  }
  
  return { isValid: true };
}

/**
 * Decimal number validation
 */
function validateDecimal(value: string): ValidationResult {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Please enter a valid decimal number'
    };
  }

  // Additional safety checks for decimal values
  if (!isFinite(num)) {
    return {
      isValid: false,
      error: 'Number must be finite'
    };
  }

  // Check for too many decimal places
  const decimalPlaces = (value.split('.')[1] || '').length;
  if (decimalPlaces > 9) {
    return {
      isValid: false,
      error: 'Too many decimal places (max 9)'
    };
  }

  // Prevent extremely large or small numbers that could cause issues
  if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
    return {
      isValid: false,
      error: 'Number too large for safe calculation'
    };
  }

  return { isValid: true };
}

/**
 * Solana public key validation
 */
function validatePublicKey(pubkey: string): ValidationResult {
  // Basic format check - should be base58 encoded, 32 bytes (44 characters)
  if (pubkey.length !== 44) {
    return {
      isValid: false,
      error: 'Public key must be 44 characters long'
    };
  }

  // Check for valid base58 characters
  const base58Pattern = /^[1-9A-HJ-NP-Za-km-z]+$/;
  if (!base58Pattern.test(pubkey)) {
    return {
      isValid: false,
      error: 'Public key contains invalid characters'
    };
  }

  return { isValid: true };
}

/**
 * Sanitize input to prevent XSS and other issues
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/script[^:]*:/gi, '') // Remove script protocols
    .replace(/data[^:]*:/gi, '') // Remove data protocol
    .replace(/vb[^:]*:/gi, ''); // Remove vbscript protocol
}

/**
 * Create input handler with validation
 */
export function createValidatedInputHandler(
  setValue: (value: string) => void,
  setError: (error: string | null) => void,
  options: InputValidationOptions = {}
) {
  return (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Prevent overflow by limiting input length
    if (options.preventOverflow && options.maxLength && value.length > options.maxLength) {
      return; // Don't update if exceeding max length
    }

    const validation = validateInput(value, options);

    setValue(validation.sanitizedValue || value);
    setError(validation.isValid ? null : validation.error || 'Invalid input');
  };
}

/**
 * Create input props with validation and accessibility
 */
export function createInputProps(
  value: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  options: InputValidationOptions & {
    label?: string;
    placeholder?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
  } = {}
) {
  const {
    maxLength,
    type = 'text',
    label,
    placeholder,
    required = false,
    ...ariaProps
  } = options;

  return {
    value,
    onChange,
    type: type === 'decimal' ? 'number' : type === 'publickey' ? 'text' : type,
    maxLength: options.preventOverflow ? maxLength : undefined,
    placeholder,
    required,
    inputProps: {
      maxLength: maxLength,
      'aria-label': ariaProps['aria-label'] || label,
      'aria-describedby': ariaProps['aria-describedby'],
      'aria-required': required,
      ...(type === 'decimal' && {
        step: 'any',
        min: 0,
      }),
    },
  };
}

/**
 * Common validation options presets
 */
export const ValidationPresets = {
  solanaAddress: {
    type: 'publickey' as const,
    maxLength: 44,
    minLength: 44,
    required: true,
    preventOverflow: true,
  },

  amount: {
    type: 'decimal' as const,
    maxLength: 20,
    required: true,
    preventOverflow: true,
  },

  url: {
    type: 'url' as const,
    maxLength: 2048,
    required: true,
    preventOverflow: true,
  },

  email: {
    type: 'email' as const,
    maxLength: 255,
    required: true,
    preventOverflow: true,
  },

  shortText: {
    type: 'text' as const,
    maxLength: 100,
    preventOverflow: true,
  },

  longText: {
    type: 'text' as const,
    maxLength: 1000,
    preventOverflow: true,
  },

  description: {
    type: 'text' as const,
    maxLength: 500,
    preventOverflow: true,
  },
} as const;
