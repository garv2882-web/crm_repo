// Admin Allowlist Config - ONLY hrakeshkumar137@gmail.com is authorized as admin
export const ADMIN_EMAILS: string[] = ['hrakeshkumar137@gmail.com'];

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === 'hrakeshkumar137@gmail.com';
}
