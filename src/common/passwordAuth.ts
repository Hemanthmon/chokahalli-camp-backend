import bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;

const MIN_LENGTH = 8;

// Kept as small, standalone primitives — not inlined into the setup/verify
// route actions — specifically so a future "forgot password" flow can call
// hashPassword/validatePasswordStrength directly instead of duplicating
// this logic. Only the identity-verification step before it (out of scope
// for now) would differ.
export const validatePasswordStrength = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
};

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

export const verifyPassword = (
  password: string,
  hash: string
): Promise<boolean> => bcrypt.compare(password, hash);
