'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

interface User {
  id: string;
  email: string;
  name: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        setUser(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm bg-space-primary/80"
      style={{
        borderColor: 'var(--border-glow)',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-star-cyan transition-opacity hover:opacity-80"
        >
          Mindraxia
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center gap-6">
          <li>
            <Link href="/" className="text-text-secondary transition-colors hover:text-star-cyan">
              Inicio
            </Link>
          </li>
        <li>
          <Link href="/blog" className="text-text-secondary transition-colors hover:text-star-cyan">
            Blog
          </Link>
        </li>
        <li>
          <Link href="/routes" className="text-text-secondary transition-colors hover:text-star-cyan">
            Rutas
          </Link>
        </li>
        <li>
          <Link href="/collections" className="text-text-secondary transition-colors hover:text-star-cyan">
            Agrupaciones
          </Link>
        </li>
          <li>
            <Link href="/about" className="text-text-secondary transition-colors hover:text-star-cyan">
              Sobre
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-text-secondary transition-colors hover:text-star-cyan">
              Contacto
            </Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
          {!loading && user && (
            <li className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
                style={{ borderColor: 'var(--border-glow)' }}
              >
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs">▼</span>
              </button>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-50 bg-space-primary"
                    style={{ borderColor: 'var(--border-glow)' }}
                  >
                    <div className="p-2 space-y-1">
                      <div className="px-3 py-2 text-xs text-text-muted border-b" style={{ borderColor: 'var(--border-glow)' }}>
                        {user.email}
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-3 py-2 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
                      >
                        Panel de Admin
                      </Link>
                      <Link
                        href="/admin/posts"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-3 py-2 text-sm rounded transition-colors hover:bg-space-secondary text-text-secondary hover:text-star-cyan"
                      >
                        Mis Posts
                      </Link>
                      <div className="border-t my-1" style={{ borderColor: 'var(--border-glow)' }} />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:bg-red-500/10 text-red-400 hover:text-red-300"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

