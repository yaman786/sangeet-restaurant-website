import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Sangeet Restaurant. Find our address, phone number, email, and opening hours.",
};

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["Sangeet Restaurant", "Hong Kong"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+852 XXXX XXXX"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["info@sangeetrestaurant.com"],
  },
  {
    icon: Clock,
    title: "Opening Hours",
    lines: ["Mon–Fri: 11:00 AM – 10:00 PM", "Sat–Sun: 10:00 AM – 11:00 PM"],
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sangeet-200/80">
            We&apos;d love to hear from you. Reach out for reservations,
            catering inquiries, or just to say hello.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Get in Touch
              </h2>
              <p className="mt-2 text-muted-foreground">
                Whether you have a question about our menu, want to book a
                private event, or need directions — we&apos;re here to help.
              </p>

              <div className="mt-8 space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sangeet-100 dark:bg-sangeet-900/40">
                      <info.icon className="h-5 w-5 text-sangeet-600 dark:text-sangeet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {info.title}
                      </h3>
                      {info.lines.map((line) => (
                        <p
                          key={line}
                          className="text-sm text-muted-foreground"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
              <h2 className="mb-6 font-serif text-xl font-bold text-foreground">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
