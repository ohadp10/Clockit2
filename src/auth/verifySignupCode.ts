import { supabase } from '../lib/supabaseClient';

export async function verifySignupCode(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    // Use 'email' for 6-digit email OTP verification
    // (link-based confirmation uses type: 'signup' with token_hash)
    type: 'email',
  });
  if (error) throw new Error(error.message);
  return { user: data.user ?? null, session: data.session ?? null };
}

