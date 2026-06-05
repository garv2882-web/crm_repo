// Admin Allowlist Config
const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || '';

export const ADMIN_EMAILS: string[] = adminEmailsEnv
  ? adminEmailsEnv.split(',').map((email: string) => email.trim().toLowerCase())
  : [];

// Ensure default admins are always included
const DEFAULT_ADMINS = ['admin@anigravity.com', 'owner@anigravity.com', 'garv@salesnest.com', 'hrakeshkumar137@gmail.com'];
DEFAULT_ADMINS.forEach(email => {
  if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
    ADMIN_EMAILS.push(email.toLowerCase());
  }
});

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
