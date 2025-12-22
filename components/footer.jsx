import Link from "next/link";
import { Mail, Instagram, Twitter, Linkedin, Crown } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background/40 backdrop-blur-xl mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-bold text-amber-500">Royal Class Events</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Curating exclusive experiences for the elite.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-amber-500 transition hover:scale-110 duration-200">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-amber-500 transition hover:scale-110 duration-200">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-amber-500 transition hover:scale-110 duration-200">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="mailto:contact@royalclassevents.com" className="text-muted-foreground hover:text-amber-500 transition hover:scale-110 duration-200">
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© 2025 Royal Class Events. All rights reserved. Made with ❤️ by Sameer Imtiaz.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-amber-500 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-amber-500 transition">Terms of Service</Link>
            <Link href="#" className="hover:text-amber-500 transition">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;