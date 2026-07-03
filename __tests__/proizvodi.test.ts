import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as listProizvodi } from '@/app/api/proizvodi/route';
import { GET as getProizvodDetalji, PATCH as updateProizvod, DELETE as deleteProizvod } from '@/app/api/proizvodi/[id]/route';
import { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'super_tajni_string_123';
const CSRF_SECRET = 'csrf-tajna-123';
process.env.JWT_SECRET = JWT_SECRET;
process.env.CSRF_SECRET = CSRF_SECRET;

vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  csrf: vi.fn((handler: (req: Request) => Promise<Response>) => handler),
}));

vi.mock('@/db/index', () => {
  const mockProizvod = {
    id: 'proizvod-123',
    naziv: 'Test Album',
    prodavac: 'user-123',
    cena: '2500',
    slika: '/img.jpg',
    izvodjac: 'Test Izvođač',
    zanr: 'Rock',
    format: 'Vinyl',
    godinaIzdavanja: 2020,
  };

  const dbMock = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    then: (resolve: (value: unknown[]) => void) => Promise.resolve([mockProizvod]).then(resolve),
    transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => {
      const txMock = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        then: (res: (value: unknown[]) => void) => res([{ id: '1' }]),
      };
      return await cb(txMock);
    }),
  };
  return { db: dbMock };
});

const createToken = (uloga: string, sub: string = 'user-123') => {
  return jwt.sign({ sub, uloga }, JWT_SECRET);
};

describe('Integracioni Testovi - Proizvodi API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/proizvodi', () => {
    it('GOST/KLIJENT: treba da vidi listu svih proizvoda (200 OK)', async () => {
      (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({ get: () => null }));
      (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({ get: () => null }));

      const response = await (listProizvodi as () => Promise<Response>)();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/proizvodi/[id]', () => {
    const params = Promise.resolve({ id: 'proizvod-123' });

    it('GOST: treba da vidi detalje ali jeKupljen treba biti false', async () => {
      (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({ get: () => null }));
      (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({ get: () => null }));

      const req = new NextRequest('http://localhost:3000/api/proizvodi/proizvod-123');
      const response = await getProizvodDetalji(req, { params });
      const body = await response.json();

      expect(body.proizvod.jeKupljen).toBe(false);
    });

    it('VLASNIK: treba da ima potpun pristup (jeKupljen: true)', async () => {
      const token = createToken('PRODAVAC', 'user-123');
      (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
        get: (n: string) => n === 'authorization' ? `Bearer ${token}` : null
      }));

      const req = new NextRequest('http://localhost:3000/api/proizvodi/proizvod-123', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const response = await getProizvodDetalji(req, { params });
      const body = await response.json();

      expect(body.proizvod.jeKupljen).toBe(true);
    });
  });

  describe('PATCH /api/proizvodi/[id]', () => {
    const params = Promise.resolve({ id: 'proizvod-123' });

    it('TUĐI PROIZVOD: Prodavac ne sme da menja tuđi proizvod (403)', async () => {
      const token = createToken('PRODAVAC', 'neko-drugi');
      (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
        get: (n: string) => n === 'authorization' ? `Bearer ${token}` : CSRF_SECRET
      }));

      const req = new NextRequest('http://localhost:3000/api/proizvodi/proizvod-123', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'x-csrf-token': CSRF_SECRET },
        body: JSON.stringify({ naziv: 'Hakovano' })
      });

      const response = await updateProizvod(req, { params });
      expect(response.status).toBe(403);
    });

    it('VLASNIK: Dozvoljava izmenu sopstvenog proizvoda (200 OK)', async () => {
      const token = createToken('PRODAVAC', 'user-123');
      (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
        get: (n: string) => n === 'authorization' ? `Bearer ${token}` : CSRF_SECRET
      }));

      const req = new NextRequest('http://localhost:3000/api/proizvodi/proizvod-123', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'x-csrf-token': CSRF_SECRET },
        body: JSON.stringify({ naziv: 'Novi Naziv', cena: 3000, pesme: [] })
      });

      const response = await updateProizvod(req, { params });
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/proizvodi/[id]', () => {
    const params = Promise.resolve({ id: 'proizvod-123' });

    it('NEULOGOVAN: Ne sme se brisati bez tokena (401)', async () => {
      (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({ get: () => null }));

      const req = new NextRequest('http://localhost:3000/api/proizvodi/proizvod-123', {
        method: 'DELETE',
        headers: { 'x-csrf-token': CSRF_SECRET }
      });
      const response = await deleteProizvod(req, { params });
      expect(response.status).toBe(401);
    });
  });
});