import { supabase } from '../lib/supabaseClient';


export async function requestPasswordReset(email: string) {
// ישלח אימייל עם "קוד" (לא לינק), לפי התבנית שהגדרת עם {{ .Token }}
const { error } = await supabase.auth.resetPasswordForEmail(email);
if (error) throw new Error(error.message);
return { ok: true };
}