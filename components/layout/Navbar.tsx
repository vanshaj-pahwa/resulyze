'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-lg shadow-black/5'
          : 'bg-white/60 backdrop-blur-sm border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
                <span className="text-white font-heading font-bold text-lg">R</span>
              </div>
              <span className="text-lg font-heading font-bold tracking-tight text-gray-900">
                Resul<span className="heading-gradient">yze</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:gap-3">
              <Link href="/#features">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm">
                  Features
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 text-sm">
                  How It Works
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-glow-sm hover:shadow-glow-md transition-all duration-300 gap-2">
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-lg p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              <Link href="/#features" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  Features
                </Button>
              </Link>
              <Link href="/#how-it-works" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  How It Works
                </Button>
              </Link>
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg gap-2">
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
