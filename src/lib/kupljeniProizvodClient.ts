export async function fetchKupljeniProizvodSaPesmama(id: string) {
  const res = await fetch(`/api/klijent/kupljeni-proizvodi/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju proizvoda.');
  }
  return await res.json();
}