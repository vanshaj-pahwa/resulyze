import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  PhoneCall
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = {
    product: [
      { name: 'Resume Optimizer', href: '/dashboard' },
      { name: 'Job Description Analysis', href: '/dashboard' },
      { name: 'ATS Score Calculator', href: '/dashboard' },
      { name: 'Cover Letter Generator', href: '/dashboard' },
      { name: 'Interview Preparation', href: '/dashboard' },
    ],
    resources: [
      { name: 'Resume Tips', href: '/resources/resume-tips' },
      { name: 'Interview Guide', href: '/resources/interview-guide' },
      { name: 'Career Blog', href: '/blog' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Middle section with links */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-md">R</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Resulyze</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered resume and cover letter builder to help you land your dream job.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-500 hover:text-blue-600 transition">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" className="text-gray-500 hover:text-blue-600 transition">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" className="text-gray-500 hover:text-blue-600 transition">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com" className="text-gray-500 hover:text-blue-600 transition">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-600 transition">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
