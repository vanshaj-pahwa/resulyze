'use client';

import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import AuthTokenHandler from '../auth/AuthTokenHandler';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <SignedIn>
        <AuthTokenHandler />
      </SignedIn>
      <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-9 w-9 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">Resulyze</span>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <SignedOut>
                <div className="hidden md:flex md:items-center md:gap-2">
                  <SignInButton>
                    <Button variant="outline" className="rounded-md">
                      Log in
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Sign up free
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
              
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-md mr-2 hidden md:inline-flex">
                    Dashboard
                  </Button>
                </Link>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8",
                    }
                  }}
                />
              </SignedIn>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden rounded-md p-2 text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="space-y-1 px-4 py-3">
              <SignedOut>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <SignInButton>
                    <Button variant="outline" className="w-full rounded-md">
                      Log in
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600">
                      Sign up
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
