import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GetKlijenti } from '@/app/api/prodavac/klijenti/route';
import { GET as GetProdaja } from '@/app/api/prodavac/prodaja/route';
import { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  csrf: vi.fn((handler: (req: Request) => Promise<Response>) => handler),
}));

vi.mock('@/db/index', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnValue([]),
    orderBy: vi.fn().mockReturnValue([]),
  },
}));

const JWT_SECRET = process.env.JWT_SECRET || 'tvoja_tajna_sifra_123';

const createValidToken = (uloga: string, sub: string = 'test-prodavac-id') => {
  return jwt.sign(
    { sub, email: 'prodavac@test.com', uloga },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

describe('API Prodavac - Klijenti ruta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('treba da vrati 401 ako nema tokena', async () => {
    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(new Map()));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const req = new NextRequest('http://localhost:3000/api/prodavac/klijenti');
    const response = await GetKlijenti(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Niste ulogovani.');
  });

  it('treba da vrati 401 ako je token nevalidan', async () => {
    const mockHeaders = new Map();
    mockHeaders.set('authorization', 'Bearer nevalidan-token');

    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(mockHeaders));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const req = new NextRequest('http://localhost:3000/api/prodavac/klijenti');
    const response = await GetKlijenti(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Sesija nevažeća ili je istekla.');
  });

  it('treba da vrati 403 ako korisnik nije PRODAVAC', async () => {
    const token = createValidToken('KLIJENT');
    const mockHeaders = new Map();
    mockHeaders.set('authorization', `Bearer ${token}`);

    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(mockHeaders));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const req = new NextRequest('http://localhost:3000/api/prodavac/klijenti');
    const response = await GetKlijenti(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain('Nemate pravo pristupa');
  });
});

describe('API Prodavac - Prodaja ruta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('treba da vrati 401 ako nema tokena', async () => {
    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(new Map()));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const response = await GetProdaja();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Niste ulogovani.');
  });

  it('treba da vrati 401 ako je token nevalidan', async () => {
    const mockHeaders = new Map();
    mockHeaders.set('authorization', 'Bearer invalid-xyz');

    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(mockHeaders));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const response = await GetProdaja();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Sesija nevažeća.');
  });

  it('treba da vrati 403 ako korisnik nije PRODAVAC', async () => {
    const token = createValidToken('KLIJENT');
    const mockHeaders = new Map();
    mockHeaders.set('authorization', `Bearer ${token}`);

    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(mockHeaders));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const response = await GetProdaja();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain('Nemate pravo pristupa');
  });

  it('treba da vrati 200 sa podacima ako je PRODAVAC ulogovan', async () => {
    const token = createValidToken('PRODAVAC', 'prodavac-123');
    const mockHeaders = new Map();
    mockHeaders.set('authorization', `Bearer ${token}`);

    (headers as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve(mockHeaders));
    (cookies as ReturnType<typeof vi.fn>).mockReturnValue(Promise.resolve({
      get: vi.fn().mockReturnValue(undefined)
    }));

    const response = await GetProdaja();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});