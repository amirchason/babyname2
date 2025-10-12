/**
 * Admin Configuration
 *
 * List of admin email addresses that have elevated privileges
 */

export const ADMIN_EMAILS = [
  'earthiaone@gmail.com'
];

/**
 * Check if an email belongs to an admin user
 */
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

export default {
  ADMIN_EMAILS,
  isAdminEmail
};
