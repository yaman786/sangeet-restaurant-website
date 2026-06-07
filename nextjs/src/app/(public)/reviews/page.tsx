import type { Metadata } from "next";
import Link from "next/link";
import { Star, CheckCircle, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read what our guests say about Sangeet Restaurant. Share your own dining experience.",
};

const reviews = [
  { id: "1", customer_name: "Sarah L.", rating: 5, review_text: "The best Indian food I've had in Hong Kong. The butter chicken is absolutely divine and the naan is perfect!", is_verified: true, created_at: "2026-05-15" },
  { id: "2", customer_name: "James W.", rating: 5, review_text: "Amazing momos and great atmosphere. The staff are incredibly welcoming. Will definitely come back!", is_verified: true, created_at: "2026-05-10" },
  { id: "3", customer_name: "Ming C.", rating: 4, review_text: "Authentic flavors and generous portions. The biryani is a must-try. Slightly long wait during peak hours.", is_verified: true, created_at: "2026-05-02" },
  { id: "4", customer_name: "Priya S.", rating: 5, review_text: "Felt like home! The dal makhani and roti brought back so many memories. Thank you Sangeet!", is_verified: true, created_at: "2026-04-28" },
  { id: "5", customer_name: "Tom H.", rating: 5, review_text: "Came for a birthday dinner and the team made it so special. The thali set is incredible value.", is_verified: false, created_at: "2026-04-20" },
  { id: "6", customer_name: "Lisa K.", rating: 4, review_text: "Really enjoyed the vegetarian options. The paneer tikka masala is my new favorite!", is_verified: true, created_at: "2026-04-15" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-HK", { dateStyle: "medium" }).format(
    new Date(date)
  );
}

export default function ReviewsPage() {
  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Guest Reviews
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sangeet-200/80">
            See what our guests have to say about their dining experience at
            Sangeet Restaurant.
          </p>

          {/* Stats */}
          <div className="mt-8 inline-flex items-center gap-6 rounded-2xl border border-sangeet-400/20 bg-white/5 px-8 py-4 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-sangeet-400">{avgRating}</p>
              <div className="mt-1 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(Number(avgRating))
                        ? "fill-sangeet-400 text-sangeet-400"
                        : "text-sangeet-400/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{reviews.length}</p>
              <p className="mt-1 text-xs text-sangeet-200/60">Total Reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* CTA */}
          <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sangeet-100 dark:bg-sangeet-900/40">
                <MessageSquare className="h-5 w-5 text-sangeet-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Enjoyed your visit?
                </h3>
                <p className="text-xs text-muted-foreground">
                  We&apos;d love to hear about your experience.
                </p>
              </div>
            </div>
            <Link
              href="/reviews/submit"
              className="rounded-lg bg-sangeet-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Write a Review
            </Link>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {review.customer_name}
                      </h3>
                      {review.is_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-sangeet-400 text-sangeet-400"
                            : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {review.review_text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
