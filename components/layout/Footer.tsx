import Link from "next/link";
import { Facebook, Instagram, PhoneCall, MessageCircleMore } from "lucide-react";

const footerLinks = [
  { href: "/products", label: "Catalogue" },
  { href: "/cart", label: "Panier" },
  { href: "/checkout", label: "Commander" },
  { href: "/auth", label: "Mon compte" },
];

const socialLinks = [
  { href: "https://facebook.com/khidma.shop", label: "Facebook", icon: Facebook },
  { href: "https://instagram.com/khidma.shop", label: "Instagram", icon: Instagram },
  { href: "https://wa.me/2250700000001", label: "WhatsApp", icon: MessageCircleMore },
];

const contactNumbers = [
  { href: "tel:+2250700000001", label: "+225 07 00 00 00 01" },
  { href: "tel:+2250700000002", label: "+225 07 00 00 00 02" },
];

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="container-safe py-10 sm:py-12">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-black/45">KHIDMA SHOP</p>
            <h2 className="text-2xl font-semibold tracking-tight">Une boutique simple, claire et facile à utiliser.</h2>
            <p className="max-w-md text-sm leading-6 text-black/60">
              Découvrez des vêtements, des chaussures et de l’électronique avec des produits utiles et faciles à choisir.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Navigation</p>
            <ul className="mt-4 space-y-3 text-sm text-black/60">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link className="transition hover:text-black" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-black/60">
              {contactNumbers.map((item) => (
                <li key={item.href}>
                  <a className="inline-flex items-center gap-2 transition hover:text-black" href={item.href}>
                    <PhoneCall className="h-4 w-4" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Réseaux sociaux</p>
            <ul className="mt-4 space-y-3 text-sm text-black/60">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <a
                      className="inline-flex items-center gap-2 transition hover:text-black"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-black/10 pt-4 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KHIDMA SHOP. Tous droits réservés.</p>
          <p>Simple, clair et pratique.</p>
        </div>
      </div>
    </footer>
  );
}
