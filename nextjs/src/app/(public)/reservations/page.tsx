import type { Metadata } from "next";
import { ReservationForm } from "./reservation-form";

export const metadata: Metadata = {
  title: "Reservations",
  description:
    "Book a table at Sangeet Restaurant. Choose your date, time, and party size for an unforgettable dining experience.",
};

export default function ReservationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Reserve a Table
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sangeet-200/80">
            Secure your spot for an unforgettable dining experience. Choose your
            preferred date, time, and let us take care of the rest.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            <ReservationForm />
          </div>

          {/* Info */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: "Confirmation",
                desc: "You'll receive an email confirmation once your booking is approved.",
              },
              {
                title: "Cancellation",
                desc: "Free cancellation up to 2 hours before your reservation time.",
              },
              {
                title: "Large Parties",
                desc: "For groups of 10+, please contact us directly for special arrangements.",
              },
            ].map((info) => (
              <div
                key={info.title}
                className="rounded-xl border border-border bg-card p-4"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {info.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {info.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
