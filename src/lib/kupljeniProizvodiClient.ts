export async function fetchKupljeniProizvodi() {
  const res = await fetch('/api/klijent/kupljeni-proizvodi', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju kupljenih proizvoda.');
  }
  return await res.json();
}