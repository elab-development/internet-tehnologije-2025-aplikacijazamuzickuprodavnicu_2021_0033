/* eslint-disable @next/next/no-html-link-for-pages */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string; width?: number; height?: number }) => <img {...props} />,
}));

const HeaderMock = ({ user }: { user: { uloga: string } | null }) => (
  <header>
    {!user ? (
      <>
        <a href="/login">Prijava</a>
        <a href="/register">Registracija</a>
      </>
    ) : (
      <>
        {user.uloga === 'KLIJENT' && (
          <>
            <a href="/stranice/svi-proizvodi">Prodavnica</a>
            <a href="/stranice/kupljeni-proizvodi">Moja kolekcija</a>
            <a href="/stranice/korpa">Korpa</a>
          </>
        )}
        {user.uloga === 'PRODAVAC' && (
          <>
            <a href="/stranice/dodaj-proizvod">Dodaj proizvod</a>
            <a href="/stranice/izmeni-proizvod">Izmeni proizvod</a>
            <a href="/stranice/pregled-prodaje-proizvoda">Prodaja</a>
          </>
        )}
        {user.uloga === 'ADMIN' && (
          <>
            <a href="/stranice/pregled-korisnika">Korisnici</a>
            <a href="/stranice/statistika-prodaje">Statistika</a>
          </>
        )}
        <button>Logout</button>
      </>
    )}
  </header>
);

const FooterMock = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <p>Muzička Prodavnica</p>
      <a href="mailto:prodavnica@muzika.rs">prodavnica@muzika.rs</a>
      <p>© {currentYear} Muzička Prodavnica</p>
    </footer>
  );
};

const TrackListaMock = ({ pesme }: { pesme: { id: string; naziv: string; trajanje: number }[] }) => (
  <div>
    <h2>Tracklista</h2>
    <ul>
      {pesme.map((p, idx) => (
        <li key={p.id} data-testid={`pesma-${idx}`}>
          {idx + 1}. {p.naziv}
        </li>
      ))}
    </ul>
  </div>
);

const RoleGuardMock = ({ children, allowedRoles, userRole }: {
  children: React.ReactNode;
  allowedRoles: string[];
  userRole: string;
}) => {
  if (!allowedRoles.includes(userRole)) return null;
  return <>{children}</>;
};

describe('UI Komponente', () => {

  describe('Header Komponenta', () => {
    it('Prikazuje linkove za gosta', () => {
      render(<HeaderMock user={null} />);
      expect(screen.getByText('Prijava')).toBeInTheDocument();
      expect(screen.getByText('Registracija')).toBeInTheDocument();
    });

    it('Prikazuje linkove specifične za KLIJENTA', () => {
      render(<HeaderMock user={{ uloga: 'KLIJENT' }} />);
      expect(screen.getByText('Prodavnica')).toBeInTheDocument();
      expect(screen.getByText('Moja kolekcija')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('Prikazuje linkove specifične za PRODAVCA', () => {
      render(<HeaderMock user={{ uloga: 'PRODAVAC' }} />);
      expect(screen.getByText('Dodaj proizvod')).toBeInTheDocument();
      expect(screen.getByText('Izmeni proizvod')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('Prikazuje linkove specifične za ADMINA', () => {
      render(<HeaderMock user={{ uloga: 'ADMIN' }} />);
      expect(screen.getByText('Korisnici')).toBeInTheDocument();
      expect(screen.getByText('Statistika')).toBeInTheDocument();
    });
  });

  describe('Footer Komponenta', () => {
    it('Prikazuje naziv prodavnice', () => {
      render(<FooterMock />);
      expect(screen.getAllByText('Muzička Prodavnica').length).toBeGreaterThan(0);
    });

    it('Prikazuje kontakt email', () => {
      render(<FooterMock />);
      expect(screen.getByText('prodavnica@muzika.rs')).toBeInTheDocument();
    });

    it('Prikazuje copyright sa trenutnom godinom', () => {
      render(<FooterMock />);
      const year = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
    });
  });

  describe('TrackLista Komponenta', () => {
    const mockPesme = [
      { id: 'p-1', naziv: 'Speak to Me', trajanje: 68 },
      { id: 'p-2', naziv: 'Breathe', trajanje: 163 },
    ];

    it('Prikazuje sve pesme', () => {
      render(<TrackListaMock pesme={mockPesme} />);
      expect(screen.getByTestId('pesma-0')).toBeInTheDocument();
      expect(screen.getByTestId('pesma-1')).toBeInTheDocument();
    });

    it('Prikazuje nazive pesama', () => {
      render(<TrackListaMock pesme={mockPesme} />);
      expect(screen.getByText(/Speak to Me/)).toBeInTheDocument();
      expect(screen.getByText(/Breathe/)).toBeInTheDocument();
    });
  });

  describe('RoleGuard Komponenta', () => {
    it('KLIJENT ne može videti ADMIN sadržaj', () => {
      render(
        <RoleGuardMock allowedRoles={['ADMIN']} userRole="KLIJENT">
          <div data-testid="tajna">Admin Sadržaj</div>
        </RoleGuardMock>
      );
      expect(screen.queryByTestId('tajna')).not.toBeInTheDocument();
    });

    it('ADMIN može videti ADMIN sadržaj', () => {
      render(
        <RoleGuardMock allowedRoles={['ADMIN']} userRole="ADMIN">
          <div data-testid="tajna">Admin Sadržaj</div>
        </RoleGuardMock>
      );
      expect(screen.getByTestId('tajna')).toBeInTheDocument();
    });

    it('PRODAVAC može videti PRODAVAC sadržaj', () => {
      render(
        <RoleGuardMock allowedRoles={['PRODAVAC']} userRole="PRODAVAC">
          <div data-testid="prodavac-sadrzaj">Prodavac Sadržaj</div>
        </RoleGuardMock>
      );
      expect(screen.getByTestId('prodavac-sadrzaj')).toBeInTheDocument();
    });
  });

  describe('Pretraga Proizvoda', () => {
    it('Prikazuje search polje i ime prodavca', () => {
      const proizvod = { naziv: 'Pink Floyd Album', prodavacIme: 'Nikola', prodavacPrezime: 'Jov' };
      render(
        <div>
          <input placeholder="Pretraži po nazivu, izvođaču, žanru..." />
          <div data-testid="prodavac">{proizvod.prodavacIme} {proizvod.prodavacPrezime}</div>
        </div>
      );
      expect(screen.getByPlaceholderText('Pretraži po nazivu, izvođaču, žanru...')).toBeInTheDocument();
      expect(screen.getByTestId('prodavac')).toHaveTextContent('Nikola Jov');
    });
  });
});