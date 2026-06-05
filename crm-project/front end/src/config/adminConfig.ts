// Admin Allowlist Config
const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || '';

export const ADMIN_EMAILS: string[] = adminEmailsEnv
  ? adminEmailsEnv.split(',').map((email: string) => email.trim().toLowerCase())
  : [];

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
