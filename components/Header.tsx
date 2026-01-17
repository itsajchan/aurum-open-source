"use client";

import { useState } from "react";
import { Package, LayoutGrid, MessageSquare, Github, Twitter, Linkedin, Menu, X } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  activePage?: "home" | "chat" | "inventory";
}

export default function Header({ activePage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          <span>Aurum</span>
          <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 ml-1 hidden sm:inline">Open Source</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/chat"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === "chat"
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <MessageSquare size={18} />
            <span>Chat</span>
          </Link>
          <Link
            href="/inventory"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === "inventory"
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <LayoutGrid size={18} />
            <span>Inventory</span>
          </Link>
        </nav>
        
        {/* Desktop Social Links */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/itsajchan"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="https://twitter.com/itsajchan"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Twitter"
          >
            <Twitter size={20} />
          </a>
          <a
            href="https://linkedin.com/in/itsajchan"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                activePage === "chat"
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <MessageSquare size={18} />
              <span>Chat</span>
            </Link>
            <Link
              href="/inventory"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                activePage === "inventory"
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <LayoutGrid size={18} />
              <span>Inventory</span>
            </Link>
            
            {/* Mobile Social Links */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-neutral-200 dark:border-neutral-800 mt-2">
              <a
                href="https://github.com/itsajchan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com/itsajchan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com/in/itsajchan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
