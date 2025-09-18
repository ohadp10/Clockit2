import { supabase } from '@/lib/supabaseClient';

export type Client = {
  id: string;
  name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ListParams = {
  search?: string;
  page?: number;       // 1-based
  pageSize?: number;   // default 20
  orderBy?: 'updated_at' | 'created_at' | 'name';
  ascending?: boolean;
};

const DEFAULT_PAGE_SIZE = 20;

export async function listClients(params: ListParams = {}) {
  const {
    search = '',
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    orderBy = 'updated_at',
    ascending = false,
  } = params;

  let q = supabase.from('clients').select('*', { count: 'exact' });
  if (search.trim()) {
    const s = `%${search.trim().toLowerCase()}%`;
    q = q.ilike('name', s);
  }
  q = q.order(orderBy, { ascending });

  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;
  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  return { rows: (data as Client[]) ?? [], count: count ?? 0, page, pageSize };
}

export async function getClient(id: string) {
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as Client;
}

export async function createClient(input: { name: string; notes?: string | null; }) {
  const name = (input.name || '').trim();
  if (!name) throw new Error('שםלקוחחייבלהיותמולא');
  if (name.length > 120) throw new Error('שםלקוחארוךמדי');
  const payload: any = { name };
  if (typeof input.notes !== 'undefined') payload.notes = input.notes;
  // Set owner_id explicitly if required by RLS/table schema
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (userId) payload.owner_id = userId;
  } catch { /* ignore */ }

  const { data, error } = await supabase.from('clients').insert(payload).select().single();
  if (error) {
    if (/duplicate key|unique/i.test(error.message)) throw new Error('שםלקוחכברקייםאצלך');
    throw new Error(error.message);
  }
  return data as Client;
}

export async function updateClient(id: string, patch: { name?: string; notes?: string | null; }) {
  const upd: any = { ...patch };
  if (typeof patch.name !== 'undefined') {
    const name = (patch.name || '').trim();
    if (!name) throw new Error('שםלקוחחייבלהיותמולא');
    if (name.length > 120) throw new Error('שםלקוחארוךמדי');
    upd.name = name;
  }
  const { data, error } = await supabase.from('clients').update(upd).eq('id', id).select().single();
  if (error) {
    if (/duplicate key|unique/i.test(error.message)) throw new Error('שםלקוחכברקייםאצלך');
    throw new Error(error.message);
  }
  return data as Client;
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
