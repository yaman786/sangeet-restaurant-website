import Link from "next/link";
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  MessageCircle,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sangeet-500 to-sangeet-700">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold leading-tight">
                  Sangeet
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Restaurant
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Authentic Indian &amp; Nepali cuisine crafted with love and
              tradition, right in the heart of Hong Kong.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-sangeet-500 hover:text-white"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-sangeet-500 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/menu", label: "Our Menu" },
                { href: "/reservations", label: "Reservations" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/reviews", label: "Reviews" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-sangeet-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sangeet-500" />
                <span>Hong Kong</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-sangeet-500" />
                <span>+852 XXXX XXXX</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-sangeet-500" />
                <span>info@sangeetrestaurant.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Opening Hours
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-sangeet-500" />
                <div>
                  <p className="font-medium text-foreground">Mon – Fri</p>
                  <p>11:00 AM – 10:00 PM</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-sangeet-500" />
                <div>
                  <p className="font-medium text-foreground">Sat – Sun</p>
                  <p>10:00 AM – 11:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Sangeet Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
