async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/csrf-token');
  const data = await res.json();
  return data.csrfToken;
}

export async function fetchProizvodi() {
  const res = await fetch('/api/proizvodi', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju proizvoda.');
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Greška pri učitavanju proizvoda.');
  return data;
}

export async function getProizvodSaPesmama(id: string) {
  const res = await fetch(`/api/proizvodi/${id}`, { method: 'GET' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju detalja proizvoda.');
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Greška pri učitavanju detalja proizvoda.');
  return data.proizvod;
}

export async function obrisiProizvod(id: string) {
  const csrfToken = await getCsrfToken();
  const res = await fetch(`/api/proizvodi/${id}`, {
    method: 'DELETE',
    headers: { 'x-csrf-token': csrfToken }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    return { success: false, error: err.error || 'Greška pri brisanju proizvoda.' };
  }
  return await res.json();
}

export async function createProizvod(payload: unknown) {
  const csrfToken = await getCsrfToken();
  const res = await fetch('/api/proizvodi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    return { success: false, error: err.error || 'Greška pri kreiranju proizvoda.' };
  }
  return await res.json();
}

export async function updateProizvod(id: string, data: unknown) {
  const csrfToken = await getCsrfToken();
  const res = await fetch(`/api/proizvodi/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken
    },
    body: JSON.stringify(data),
  });
  return res.json();
}