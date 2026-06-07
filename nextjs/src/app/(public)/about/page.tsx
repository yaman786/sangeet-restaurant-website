import type { Metadata } from "next";
import { ChefHat, Heart, Award, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Sangeet Restaurant's story, our passion for authentic Indian and Nepali cuisine, and the team behind the flavors.",
};

const values = [
  {
    icon: Heart,
    title: "Authentic Recipes",
    description:
      "Every dish is prepared using traditional recipes passed down through generations, preserving the true essence of Indian and Nepali cuisine.",
  },
  {
    icon: ChefHat,
    title: "Expert Chefs",
    description:
      "Our team of skilled chefs brings decades of combined experience, each specializing in regional cuisines from across the subcontinent.",
  },
  {
    icon: Award,
    title: "Quality Ingredients",
    description:
      "We source the finest spices and freshest ingredients, many imported directly from India and Nepal, to ensure unparalleled flavor.",
  },
  {
    icon: Sparkles,
    title: "Warm Hospitality",
    description:
      "From the moment you walk in, our staff is dedicated to making your dining experience memorable and welcoming.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Our Story
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sangeet-200/80">
            A journey of flavors, tradition, and passion — from the heart of the
            Indian subcontinent to Hong Kong.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto max-w-none text-muted-foreground">
            <div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">
                Where it all began
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Sangeet Restaurant was born from a deep love for the rich,
                diverse culinary traditions of India and Nepal. Our founders, driven
                by a passion to share the authentic flavors of their homeland,
                opened the doors of Sangeet in the vibrant city of Hong Kong.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                The name &ldquo;Sangeet&rdquo; — meaning &ldquo;music&rdquo; in Hindi —
                reflects our belief that great food, like great music, brings
                people together. Every meal at Sangeet is a symphony of spices,
                textures, and aromas carefully composed to delight your senses.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">
                Our Philosophy
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                We believe that the best meals are made with love, patience, and
                the finest ingredients. Our kitchen team takes pride in grinding
                fresh spices daily, marinating meats for hours, and slow-cooking
                curries to perfection. No shortcuts, no compromises — just honest,
                soulful food.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Whether you&apos;re savoring our signature Butter Chicken, sharing
                a plate of freshly steamed momos, or enjoying a fragrant biryani,
                each dish tells a story of culinary heritage and craftsmanship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-sangeet-600">
              What Sets Us Apart
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
              Our Values
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sangeet-100 to-sangeet-200 dark:from-sangeet-900/40 dark:to-sangeet-800/40">
                  <value.icon className="h-7 w-7 text-sangeet-600 dark:text-sangeet-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
