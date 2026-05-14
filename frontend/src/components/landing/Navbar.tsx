"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

const navLinks = ["Services", "About Us", "Projects", "Team", "Contacts"];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 lg:px-16 py-5">
      {/* Logo */}
      <div className="text-[hsl(0_0%_96%)] text-xl font-semibold tracking-tight">
        SENTINEL
      </div>

      {/* Nav Links - Hidden on mobile */}
      <div className="hidden md:flex gap-8">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(" ", "-")}`}
            className="text-sm text-[hsl(0_0%_60%)] hover:text-[hsl(0_0%_96%)] transition-colors uppercase tracking-widest"
          >
            {link}
          </a>
        ))}
      </div>

      {/* CTA Button - Hidden on mobile */}
      <Button
        variant="navCta"
        size="lg"
        className="hidden md:inline-flex rounded-lg uppercase text-xs tracking-widest px-6"
      >
        Get Quote
      </Button>
    </nav>
  );
}