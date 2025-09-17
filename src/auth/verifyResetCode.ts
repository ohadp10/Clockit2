import { supabase } from '../lib/supabaseClient';


export async function verifyResetCode(email: string, code: string) {
// מאשר את קוד השחזור ויוצר session זמני לשינוי הסיסמה
const { data, error } = await supabase.auth.verifyOtp({
email,
token: code,
type: 'recovery',
});
if (error) throw new Error(error.message);
return { user: data.user ?? null, session: data.session ?? null };
}