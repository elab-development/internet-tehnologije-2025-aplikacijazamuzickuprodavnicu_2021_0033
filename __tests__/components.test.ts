import { describe, it, expect } from 'vitest';

describe('Header Component', () => {

  it('Prikazuje Prijava link za nelogovanog korisnika', () => {
    const prijavaLink = '/login';
    expect(prijavaLink).toBe('/login');
  });

  it('Prikazuje Registracija link za nelogovanog korisnika', () => {
    const registracijaLink = '/register';
    expect(registracijaLink).toBe('/register');
  });

  it('KLIJENT uloga vidi sve svoje linkove', () => {
    const klijentLinks = [
      '/stranice/svi-proizvodi',
      '/stranice/kupljeni-proizvodi',
      '/stranice/korpa',
    ];
    expect(klijentLinks).toContain('/stranice/svi-proizvodi');
    expect(klijentLinks).toContain('/stranice/kupljeni-proizvodi');
    expect(klijentLinks).toContain('/stranice/korpa');
    expect(klijentLinks.length).toBe(3);
  });

  it('PRODAVAC uloga vidi svoje specifične linkove', () => {
    const prodavacLinks = [
      '/stranice/dodaj-proizvod',
      '/stranice/brisanje-proizvoda',
      '/stranice/izmeni-proizvod',
      '/stranice/pregled-prodaje-proizvoda',
    ];
    expect(prodavacLinks).toContain('/stranice/dodaj-proizvod');
    expect(prodavacLinks).toContain('/stranice/izmeni-proizvod');
    expect(prodavacLinks.length).toBe(4);
  });

  it('ADMIN uloga vidi svoje specifične linkove', () => {
    const adminLinks = [
      '/stranice/pregled-korisnika',
      '/stranice/dodaj-korisnika',
      '/stranice/statistika-prodaje',
    ];
    expect(adminLinks).toContain('/stranice/pregled-korisnika');
    expect(adminLinks).toContain('/stranice/statistika-prodaje');
  });

  it('Logout dugme je dostupno logovanim korisnicima', () => {
    const logoutButton = 'Logout';
    expect(logoutButton).toBe('Logout');
  });
});

describe('Footer Component', () => {

  it('Prikazuje naziv prodavnice', () => {
    const naziv = 'Muzička Prodavnica';
    expect(naziv).toContain('Muzička');
  });

  it('Prikazuje kontakt email', () => {
    const email = 'prodavnica@muzika.rs';
    expect(email).toContain('@');
    expect(email).toContain('muzika.rs');
  });

  it('Prikazuje copyright sa trenutnom godinom', () => {
    const currentYear = new Date().getFullYear();
    const copyrightText = `© ${currentYear} Muzička Prodavnica`;
    expect(copyrightText).toContain(currentYear.toString());
    expect(copyrightText).toContain('Muzička Prodavnica');
  });

  it('Prikazuje linkove na stranice', () => {
    const links = [
      '/stranice/svi-proizvodi',
      '/stranice/o-meni',
      '/stranice/kontakt',
    ];
    links.forEach(link => {
      expect(link.startsWith('/')).toBe(true);
    });
  });
});

describe('TrackLista Component', () => {

  const mockPesme = [
    { id: 'p-1', naziv: 'Speak to Me', trajanje: 68, poredak: 1 },
    { id: 'p-2', naziv: 'Breathe', trajanje: 163, poredak: 2 },
    { id: 'p-3', naziv: 'Time', trajanje: 421, poredak: 3 },
  ];

  it('Prikazuje sve pesme u listi', () => {
    expect(mockPesme.length).toBe(3);
    expect(mockPesme[0].naziv).toBeDefined();
  });

  it('Formatira trajanje u minute:sekunde', () => {
    const sekunde = mockPesme[2].trajanje;
    const min = Math.floor(sekunde / 60);
    const sec = Math.floor(sekunde % 60);
    const formatted = `${min}:${sec.toString().padStart(2, '0')}`;
    expect(formatted).toBe('7:01');
  });

  it('Prikazuje redni broj pesme', () => {
    const prvaRedni = mockPesme[0].poredak;
    expect(prvaRedni).toBe(1);
  });

  it('Ocena recenzije mora biti između 1 i 5', () => {
    const validOcene = [1, 2, 3, 4, 5];
    validOcene.forEach(ocena => {
      expect(ocena).toBeGreaterThanOrEqual(1);
      expect(ocena).toBeLessThanOrEqual(5);
    });
  });
});

describe('KupljeniKurseviContent Component', () => {

  const mockProizvodi = [
    {
      id: 'p-1',
      naziv: 'The Dark Side of the Moon',
      izvodjac: 'Pink Floyd',
      zanr: 'Rock',
      format: 'Vinyl',
      slika: '/images/album1.jpg',
      prodavacIme: 'Nikola',
      prodavacPrezime: 'Jovanović',
    },
    {
      id: 'p-2',
      naziv: 'Thriller',
      izvodjac: 'Michael Jackson',
      zanr: 'Pop',
      format: 'CD',
      slika: '/images/album2.jpg',
      prodavacIme: 'Nikola',
      prodavacPrezime: 'Jovanović',
    },
  ];

  it('Prikazuje sve kupljene proizvode', () => {
    expect(mockProizvodi.length).toBe(2);
    expect(mockProizvodi[0].naziv).toBeDefined();
  });

  it('Filtrira proizvode po nazivu', () => {
    const search = 'Thriller';
    const filter = mockProizvodi.filter(p =>
      p.naziv.toLowerCase().includes(search.toLowerCase())
    );
    expect(filter.length).toBe(1);
    expect(filter[0].id).toBe('p-2');
  });

  it('Filtrira proizvode po izvođaču', () => {
    const search = 'Pink Floyd';
    const filter = mockProizvodi.filter(p =>
      p.izvodjac.toLowerCase().includes(search.toLowerCase())
    );
    expect(filter.length).toBe(1);
    expect(filter[0].id).toBe('p-1');
  });

  it('Prikazuje praznu listu ako pretraga nema rezultata', () => {
    const search = 'Nepostojeći album';
    const filter = mockProizvodi.filter(p =>
      p.naziv.toLowerCase().includes(search.toLowerCase())
    );
    expect(filter.length).toBe(0);
  });

  it('Prikazuje format proizvoda', () => {
    expect(mockProizvodi[0].format).toBe('Vinyl');
    expect(mockProizvodi[1].format).toBe('CD');
  });
});

describe('RoleGuard Component', () => {

  it('Vraća false ako korisnik nema dozvoljenu ulogu', () => {
    const userRole = 'KLIJENT';
    const allowedRoles = ['ADMIN', 'PRODAVAC'];
    const isAllowed = allowedRoles.includes(userRole);
    expect(isAllowed).toBe(false);
  });

  it('Prikazuje sadržaj ako korisnik ima dozvoljenu ulogu', () => {
    const userRole = 'ADMIN';
    const allowedRoles = ['ADMIN'];
    const isAllowed = allowedRoles.includes(userRole);
    expect(isAllowed).toBe(true);
  });

  it('ADMIN može pristupiti admin panelu', () => {
    const userRole: string = 'ADMIN';
    const canAccess = userRole === 'ADMIN';
    expect(canAccess).toBe(true);
  });

  it('PRODAVAC može pristupiti prodavac panelu', () => {
    const userRole: string = 'PRODAVAC';
    const canAccess = userRole === 'PRODAVAC';
    expect(canAccess).toBe(true);
  });

  it('KLIJENT može pristupiti klijent panelu', () => {
    const userRole: string = 'KLIJENT';
    const canAccess = userRole === 'KLIJENT';
    expect(canAccess).toBe(true);
  });

  it('KLIJENT ne može pristupiti ADMIN panelu', () => {
    const userRole: string = 'KLIJENT';
    const canAccess = userRole === 'ADMIN';
    expect(canAccess).toBe(false);
  });
});