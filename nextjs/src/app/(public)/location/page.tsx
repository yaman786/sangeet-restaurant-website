import type { Metadata } from "next";
import { MapPin, Navigation, Car, Train } from "lucide-react";

export const metadata: Metadata = {
  title: "Location",
  description:
    "Find Sangeet Restaurant in Hong Kong. View our location, get directions, and plan your visit.",
};

export default function LocationPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Find Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sangeet-200/80">
            Located in the heart of Hong Kong, Sangeet is easy to reach by public
            transport or car.
          </p>
        </div>
      </section>

      {/* Map + Directions */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Map Placeholder */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
                <div className="flex h-[400px] items-center justify-center bg-gradient-to-br from-muted to-muted/50 lg:h-[500px]">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-sangeet-500" />
                    <p className="mt-4 font-serif text-xl font-bold text-foreground">
                      Sangeet Restaurant
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Hong Kong
                    </p>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sangeet-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
                    >
                      <Navigation className="h-4 w-4" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Directions */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-serif text-xl font-bold text-foreground">
                  Getting Here
                </h2>

                <div className="space-y-5">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Train className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        By MTR
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Nearest MTR station is a 5-minute walk. Take Exit B and
                        walk straight.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Car className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        By Car
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Parking is available in the nearby car park. Street parking
                        also available evenings and weekends.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sangeet-100 dark:bg-sangeet-900/30">
                      <MapPin className="h-5 w-5 text-sangeet-600 dark:text-sangeet-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Address
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Sangeet Restaurant
                        <br />
                        Hong Kong
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
                  Opening Hours
                </h2>
                <div className="space-y-2.5">
                  {[
                    { day: "Monday – Friday", hours: "11:00 AM – 10:00 PM" },
                    { day: "Saturday – Sunday", hours: "10:00 AM – 11:00 PM" },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{item.day}</span>
                      <span className="font-medium text-foreground">
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
