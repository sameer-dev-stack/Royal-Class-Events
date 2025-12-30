"use client";

import {
  Phone,
  MessageCircle,
  CreditCard,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Download,
  HelpCircle,
  Smartphone,
  Globe,
  Mail,
  Ticket
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-white/10 transition-colors duration-300">

      {/* 1. TOP BAR: Contact & Trust */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* Brand & Slogan */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                <Ticket className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Royal Class <span className="text-amber-600 dark:text-amber-500">Events</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              The premier entertainment discovery and ticketing platform for exclusive events.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row gap-8 lg:justify-center">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Ticket Hotline</p>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span className="font-bold text-lg">+880 123 456 7890</span>
              </div>
              <p className="text-xs text-gray-500">Sun - Thu 9:00 - 17:00</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Get Help</p>
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-gray-300 dark:border-white/10 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500">
                <MessageCircle className="w-4 h-4" /> Chat Online
              </Button>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:text-right space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">We Accept</p>
            <div className="flex flex-wrap lg:justify-end gap-2">
              {['Visa', 'Mastercard', 'Amex', 'bKash'].map((method) => (
                <Badge key={method} variant="secondary" className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-md px-2 py-1">
                  {method}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-200 dark:bg-white/10" />

      {/* 2. MIDDLE SECTION: Navigation Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/explore" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Top Events</Link></li>
              <li><Link href="/explore?c=concerts" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Concerts & Gigs</Link></li>
              <li><Link href="/explore?c=festivals" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Festivals</Link></li>
              <li><Link href="/explore?c=sports" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Sports</Link></li>
              <li><Link href="/explore?c=arts" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Arts & Theatre</Link></li>
            </ul>
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">About Us</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Our Story</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Press Center</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Legal & Privacy</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* For Organisers */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">For Organisers</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/create-event" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">List Your Event</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Ticketing Solutions</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Scanning App</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Marketing Services</Link></li>
              <li>
                <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700 text-white border-none rounded-full px-4 h-8 text-xs font-bold">
                  Create Event
                </Button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Event Staffing</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Ticket Printing</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Access Control</Link></li>
              <li><Link href="#" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Download App */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Download the App</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Get the best experience on the go.</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start gap-3 h-12 bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white">
                <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold">Get it on</p>
                  <p className="text-sm font-bold">Google Play</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-3 h-12 bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left leading-none">
                  <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold">Download on the</p>
                  <p className="text-sm font-bold">App Store</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: Socials & Support */}
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