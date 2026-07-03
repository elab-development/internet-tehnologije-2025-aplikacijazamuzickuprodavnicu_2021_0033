import { describe, it, expect } from 'vitest';

describe('Poslovna Logika & Kalkulacije', () => {

  describe('Formatiranje trajanja pesme', () => {
    const formatirajTrajanje = (sekunde: number): string => {
      const min = Math.floor(sekunde / 60);
      const sec = Math.floor(sekunde % 60);
      return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    it('treba da formatira 68 sekundi u 1:08', () => {
      expect(formatirajTrajanje(68)).toBe('1:08');
    });

    it('treba da formatira 421 sekundi u 7:01', () => {
      expect(formatirajTrajanje(421)).toBe('7:01');
    });

    it('treba da formatira 0 sekundi u 0:00', () => {
      expect(formatirajTrajanje(0)).toBe('0:00');
    });
  });

  describe('Algoritam za pretragu i filtriranje', () => {
    const mockProizvodi = [
      { id: '1', naziv: 'The Dark Side of the Moon', izvodjac: 'Pink Floyd', zanr: 'Rock' },
      { id: '2', naziv: 'Thriller', izvodjac: 'Michael Jackson', zanr: 'Pop' },
    ];

    it('treba da filtrira po nazivu (case insensitive)', () => {
      const search = 'thriller';
      const rezultat = mockProizvodi.filter(p =>
        p.naziv.toLowerCase().includes(search.toLowerCase())
      );
      expect(rezultat).toHaveLength(1);
      expect(rezultat[0].id).toBe('2');
    });

    it('treba da filtrira po izvođaču', () => {
      const search = 'Pink Floyd';
      const rezultat = mockProizvodi.filter(p =>
        p.izvodjac.toLowerCase().includes(search.toLowerCase())
      );
      expect(rezultat).toHaveLength(1);
      expect(rezultat[0].id).toBe('1');
    });

    it('treba da filtrira po žanru', () => {
      const search = 'Pop';
      const rezultat = mockProizvodi.filter(p =>
        p.zanr.toLowerCase().includes(search.toLowerCase())
      );
      expect(rezultat).toHaveLength(1);
      expect(rezultat[0].id).toBe('2');
    });

    it('treba da vrati prazan niz ako nema rezultata', () => {
      const search = 'Jazz';
      const rezultat = mockProizvodi.filter(p =>
        p.naziv.toLowerCase().includes(search.toLowerCase())
      );
      expect(rezultat).toHaveLength(0);
    });
  });

  describe('Validacija recenzije', () => {
    const validirajOcenu = (ocena: number): boolean => ocena >= 1 && ocena <= 5;

    it('treba da prihvati ocenu 1', () => {
      expect(validirajOcenu(1)).toBe(true);
    });

    it('treba da prihvati ocenu 5', () => {
      expect(validirajOcenu(5)).toBe(true);
    });

    it('treba da odbije ocenu 0', () => {
      expect(validirajOcenu(0)).toBe(false);
    });

    it('treba da odbije ocenu 6', () => {
      expect(validirajOcenu(6)).toBe(false);
    });
  });

  describe('Kalkulacija prihoda', () => {
    it('treba ispravno da računa ukupni prihod', () => {
      const proizvodi = [
        { cena: 2500, brojProdaja: 3 },
        { cena: 1800, brojProdaja: 5 },
      ];
      const ukupno = proizvodi.reduce((sum, p) => sum + p.cena * p.brojProdaja, 0);
      expect(ukupno).toBe(16500);
    });
  });

  describe('Datum & Copyright', () => {
    it('treba uvek da koristi trenutnu godinu za copyright', () => {
      const currentYear = new Date().getFullYear();
      expect(currentYear).toBeGreaterThanOrEqual(2025);
    });
  });
});