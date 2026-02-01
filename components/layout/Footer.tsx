import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200/60 bg-white/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">R</span>
              </div>
              <span className="font-heading font-bold text-gray-900 tracking-tight">
                Resul<span className="heading-gradient">yze</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              AI-powered resume optimization and interview preparation to help you land your dream job.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-gray-900 text-sm uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {['Dashboard', 'Resume Builder', 'Interview Prep', 'Cover Letters'].map((item) => (
                <li key={item}>
                  <Link
                    href="/dashboard"
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-semibold text-gray-900 text-sm uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Features', href: '/#features' },
                { label: 'How It Works', href: '/#how-it-works' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="accent-line mb-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {currentYear} Resulyze. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
