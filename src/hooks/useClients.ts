import * as Clients from '@/services/clients';
import { useEffect, useState } from 'react';

export function useClients(initial: Clients.ListParams = {}) {
  const [params, setParams] = useState<Clients.ListParams>(initial);
  const [data, setData] = useState<{rows: Clients.Client[]; count: number}>({ rows: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  async function refresh(overrides: Partial<Clients.ListParams> = {}) {
    setLoading(true); setError('');
    try {
      const res = await Clients.listClients({ ...params, ...overrides });
      setParams(p => ({ ...p, ...overrides }));
      setData({ rows: res.rows, count: res.count });
    } catch (e: any) {
      setError(e.message || 'שגיאהבטעינתלקוחות');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh({}); }, []);
  return { ...data, loading, error, params, refresh,
           create: Clients.createClient, update: Clients.updateClient, remove: Clients.deleteClient };
}

