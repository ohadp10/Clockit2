import {
  signUp as _signUp,
  verifySignupCode as _verifySignupCode,
  login as _login,
  requestPasswordReset as _requestPasswordReset,
  verifyResetCode as _verifyResetCode,
  setNewPassword as _setNewPassword,
} from '@/auth';

export async function signUp(params: { email: string; password: string; username?: string; fullName?: string }) {
  try {
    return await _signUp(params);
  } catch (e: any) {
    const msg = (e?.message || '').toString().toLowerCase();
    if (
      msg.includes('already') && (msg.includes('registered') || msg.includes('exists'))
    ) {
      throw new Error('כתובת האימייל כבר בשימוש');
    }
    // Preserve original message for other errors
    throw e;
  }
}
export async function verifySignupCode(email: string, code: string) {
  return _verifySignupCode(email, code);
}
export async function loginWithEmailPassword(email: string, password: string) {
  return _login(email, password);
}
export async function loginWithUsernamePassword(_username: string, _password: string) {
  throw new Error('בשלבזההתחברותעםשםמשתמשלאפעילה. השתמשבאימייל.');
}
export async function requestPasswordReset(email: string) {
  return _requestPasswordReset(email);
}
export async function verifyResetCode(email: string, code: string) {
  return _verifyResetCode(email, code);
}
export async function setNewPassword(newPassword: string) {
  return _setNewPassword(newPassword);
}
