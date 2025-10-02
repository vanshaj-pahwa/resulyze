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
      <div className="container mx-auto px-6 py-12">
        
        {/* Copyright section */}
          <p className="text-sm text-center text-gray-500">
            © {currentYear} Resulyze. All rights reserved.
          </p>
      </div>
    </footer>
  );
}
