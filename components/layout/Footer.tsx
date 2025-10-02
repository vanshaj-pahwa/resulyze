import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
