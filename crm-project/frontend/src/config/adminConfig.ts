// Admin Allowlist Config - ONLY hrakeshkumar37@gmail.com is authorized as admin
export const ADMIN_EMAILS: string[] = ['hrakeshkumar37@gmail.com'];

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === 'hrakeshkumar37@gmail.com';
}
