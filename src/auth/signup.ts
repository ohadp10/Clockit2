import { supabase } from '../lib/supabaseClient';


export type SignUpParams = {
email: string;
password: string;
username?: string; // נשמר בשלב ראשון כ-user_metadata
fullName?: string; // כנ"ל
};


export async function signUp({ email, password, username, fullName }: SignUpParams) {
// שולח מייל עם "קוד" (בהנחה שעריכת את התבנית ל-{{ .Token }})
const { error, data } = await supabase.auth.signUp({
email,
password,
options: {
// נשמור את ה-username/fulll_name ב-user_metadata (אפשר להעביר לטבלת profiles בהמשך)
data: { username: username ?? null, full_name: fullName ?? null },
},
});
if (error) {
  const msg = (error as any)?.message || '';
  const lower = msg.toLowerCase();
  if (lower.includes('already') && (lower.includes('registered') || lower.includes('exists'))) {
    // Hebrew: "Email address already in use"
    throw new Error('כתובת האימייל כבר בשימוש');
  }
  throw new Error(msg || 'Signup failed');
}
const identities = (data as any)?.user?.identities;
if (Array.isArray(identities) && identities.length === 0) {
  throw new Error('כתובת האימייל כבר בשימוש');
}
return { ok: true, userId: data.user?.id ?? null };
}
