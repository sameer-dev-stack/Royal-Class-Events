"use client";

import {
  Phone,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  HelpCircle,
  Smartphone,
  Globe,
  Ticket
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer className="w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">



      {/* 3. BOTTOM SECTION: Socials & Support (Visible on all pages) */}
      <div className="bg-gray-100 dark:bg-zinc-950/50 border-t border-gray-200 dark:border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Socials */}
          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"><Facebook className="w-5 h-5" /></Link>
            <Link href="#" className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"><Twitter className="w-5 h-5" /></Link>
            <Link href="#" className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"><Youtube className="w-5 h-5" /></Link>
            <Link href="#" className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"><Linkedin className="w-5 h-5" /></Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} Royal Class Events. All rights reserved.
          </div>

          {/* Support CTA */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden lg:inline-block">Do you have any questions?</span>
            <Button variant="outline" className="gap-2 rounded-full border-gray-300 dark:border-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-500">
              <HelpCircle className="w-4 h-4" /> Visit Support Center
            </Button>
          </div>

        </div>
      </div>
    </footer>
  );
}