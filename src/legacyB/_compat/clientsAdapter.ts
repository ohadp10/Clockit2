import * as Clients from '@/services/clients';

export async function fetchClients({ q = '', page = 1, pageSize = 20 } = {}) {
  const { rows, count } = await Clients.listClients({ search: q, page, pageSize });
  // Map to minimal legacy shape if needed
  const items = rows.map(r => ({
    id: r.id,
    name: r.name,
    description: r.notes ?? '',
    logo_url: undefined,
  }));
  return { items, total: count, page, pageSize };
}

export const createClient = (input: { name: string; description?: string | null; logo_url?: string | null }) => {
  return Clients.createClient({ name: input.name, notes: input.description ?? null });
};

export const updateClient = (id: string, patch: { name?: string; description?: string | null; logo_url?: string | null }) => {
  const p: any = {};
  if (typeof patch.name !== 'undefined') p.name = patch.name;
  if (typeof patch.description !== 'undefined') p.notes = patch.description;
  return Clients.updateClient(id, p);
};

export const deleteClient = Clients.deleteClient;
export const getClient    = Clients.getClient as (id: string) => Promise<Clients.Client>;

// Legacy-style object with methods to avoid changing UI code
export const Client = {
  async filter({ q = '', owner_email = '' as any } = {} as any) {
    // owner_email ignored; RLS enforces ownership
    const { rows } = await Clients.listClients({ search: q, page: 1, pageSize: 100 });
    return rows.map(r => ({ id: r.id, name: r.name, description: r.notes ?? '', logo_url: undefined }));
  },
  async create(input: any) { return createClient(input); },
  async update(id: string, patch: any) { return updateClient(id, patch); },
  async delete(id: string) { return deleteClient(id); },
  async get(id: string) {
    const r = await Clients.getClient(id);
    return { id: r.id, name: r.name, description: r.notes ?? '', logo_url: undefined } as any;
  },
};
