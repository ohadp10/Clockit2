import { supabase } from '../lib/supabaseClient';


const ENABLE_USERNAME_LOGIN = false; // נהפוך ל-true אחרי שנוסיף Edge Function


export async function login(login: string, password: string) {
if (login.includes('@')) {
const { data, error } = await supabase.auth.signInWithPassword({ email: login, password });
if (error) {
  const raw = (error as any)?.message || '';
  const msg = raw.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    // Map Supabase invalid credentials to a clear Hebrew message
    throw new Error('אימייל או סיסמה שגויים');
  }
  throw new Error(raw || 'Login failed');
}
return { user: data.user, session: data.session };
}
if (!ENABLE_USERNAME_LOGIN) {
throw new Error('כניסה עם שם משתמש תתווסף בהמשך. בינתיים השתמש באימייל.');
}
// 🔜 לעתיד: קריאה ל-Edge Function שתמיר username→email ואז signInWithPassword
}
