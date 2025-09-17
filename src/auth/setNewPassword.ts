import { supabase } from '../lib/supabaseClient';


export async function setNewPassword(newPassword: string) {
// חייב לרוץ אחרי verifyResetCode שהעניק session זמני
const { error } = await supabase.auth.updateUser({ password: newPassword });
if (error) throw new Error(error.message);
return { ok: true };
}