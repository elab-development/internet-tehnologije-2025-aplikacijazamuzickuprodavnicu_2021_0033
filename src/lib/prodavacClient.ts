export async function fetchProdavacKlijenti() {
  const res = await fetch('/api/prodavac/klijenti', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju klijenata.');
  }
  return await res.json();
}

export async function fetchProdavacProdaja() {
  const res = await fetch('/api/prodavac/prodaja', { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Greška pri komunikaciji sa serverom.' }));
    throw new Error(err.error || 'Greška pri učitavanju prodaje.');
  }
  return await res.json();
}