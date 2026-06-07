import Link from "next/link";
import {
  Star,
  ArrowRight,
  ChefHat,
  Clock,
  Sparkles,
  CalendarDays,
  Flame,
  Leaf,
} from "lucide-react";

// This is a Server Component — data comes from Supabase
import { createClient } from "@/lib/supabase/server";

const reviews = [
  {
    id: "1",
    customer_name: "Sarah L.",
    rating: 5,
    review_text:
      "The best Indian food I've had in Hong Kong. The butter chicken is absolutely divine!",
  },
  {
    id: "2",
    customer_name: "James W.",
    rating: 5,
    review_text:
      "Amazing momos and great atmosphere. The staff are incredibly welcoming.",
  },
  {
    id: "3",
    customer_name: "Ming C.",
    rating: 4,
    review_text:
      "Authentic flavors and generous portions. The biryani is a must-try.",
  },
];

function formatCurrency(amount: number) {
  return `HK$${amount}`;
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch popular items for the featured section
  const { data: featuredItems } = await supabase
    .from("menu_items")
    .select("id, name, description, price, image_url, is_vegetarian, is_spicy, is_popular, preparation_time")
    .eq("is_popular", true)
    .eq("is_active", true)
    .limit(4);

  const items: any[] = featuredItems || [];

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-red-900">
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px),
                                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Gradient Glow */}
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-sangeet-500/20 blur-3xl" />
        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-sangeet-red-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sangeet-400/30 bg-sangeet-500/10 px-4 py-1.5 text-sm text-sangeet-300">
              <Sparkles className="h-4 w-4" />
              <span>Authentic Indian &amp; Nepali Cuisine</span>
            </div>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              A Taste of{" "}
              <span className="bg-gradient-to-r from-sangeet-300 via-sangeet-400 to-sangeet-500 bg-clip-text text-transparent">
                Tradition
              </span>
              <br />
              in Hong Kong
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-sangeet-200/80 sm:text-xl">
              Experience the rich flavors of India and Nepal, crafted with
              time-honored recipes and the freshest ingredients. Dine-in, scan
              our QR code to order, or book your table now.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/reservations"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sangeet-500 to-sangeet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sangeet-500/25 transition-all hover:shadow-xl hover:shadow-sangeet-500/30 hover:brightness-110 sm:w-auto"
              >
                <CalendarDays className="h-5 w-5" />
                Reserve a Table
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/menu"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sangeet-400/30 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto"
              >
                <ChefHat className="h-5 w-5" />
                View Our Menu
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
              {[
                { value: "5+", label: "Years Serving" },
                { value: "80+", label: "Menu Items" },
                { value: "4.8★", label: "Avg. Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-sangeet-400 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-sangeet-200/60 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURED MENU ===== */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-sangeet-600">
              Signature Dishes
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              From Our Kitchen to Your Table
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Discover our most loved dishes, prepared fresh with authentic
              recipes passed down through generations.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {item.is_vegetarian && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/90 text-white backdrop-blur-sm">
                        <Leaf className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {item.is_spicy && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sangeet-red-500/90 text-white backdrop-blur-sm">
                        <Flame className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Popular badge */}
                  {item.is_popular && (
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-sangeet-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                        <Star className="h-3 w-3 fill-current" />
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-lg bg-white/90 px-3 py-1 text-sm font-bold text-sangeet-900 backdrop-blur-sm">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{item.preparation_time} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-sangeet-500 hover:text-sangeet-600"
            >
              View Full Menu
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="border-t border-border bg-muted/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-sangeet-600">
              Guest Testimonials
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              What Our Guests Say
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-sangeet-400 text-sangeet-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{review.review_text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {review.customer_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-sangeet-600 to-sangeet-red-700 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Ready to Experience Sangeet?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Book your table today and let us take you on a culinary journey
            through the finest Indian and Nepali flavors.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/reservations"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-sangeet-700 shadow-lg transition-all hover:shadow-xl hover:brightness-95 sm:w-auto"
            >
              <CalendarDays className="h-5 w-5" />
              Reserve Now
            </Link>
            <Link
              href="/contact"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
