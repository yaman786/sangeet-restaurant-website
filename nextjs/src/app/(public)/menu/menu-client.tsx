"use client";

import { useState, useMemo } from "react";
import { Search, Flame, Leaf, Clock, Star, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_popular: boolean;
  allergens: string[] | null;
  preparation_time: number;
  is_active: boolean;
}

interface MenuPageClientProps {
  categories: Category[];
  menuItems: MenuItem[];
}

export function MenuPageClient({ categories, menuItems }: MenuPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "spicy">("all");

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category_id === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiet =
        dietFilter === "all" ||
        (dietFilter === "veg" && item.is_vegetarian) ||
        (dietFilter === "spicy" && item.is_spicy);
      return matchesCategory && matchesSearch && matchesDiet;
    });
  }, [menuItems, activeCategory, searchQuery, dietFilter]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
            Our Menu
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sangeet-200/80">
            Authentic dishes crafted with traditional recipes and the freshest
            ingredients, bringing the flavors of India and Nepal to your table.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[4.5rem] z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  activeCategory === cat.id
                    ? "bg-sangeet-500 text-white shadow-md shadow-sangeet-500/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Diet Filters */}
          <div className="mt-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {[
              { value: "all" as const, label: "All", icon: null },
              { value: "veg" as const, label: "Vegetarian", icon: Leaf },
              { value: "spicy" as const, label: "Spicy", icon: Flame },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDietFilter(filter.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                  dietFilter === filter.value
                    ? filter.value === "veg"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : filter.value === "spicy"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-sangeet-100 text-sangeet-700 dark:bg-sangeet-900/30 dark:text-sangeet-400"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.icon && <filter.icon className="h-3 w-3" />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="bg-background py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No dishes found matching your filters.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                  setDietFilter("all");
                }}
                className="mt-4 text-sm font-medium text-sangeet-500 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredItems.length} dish
                {filteredItems.length !== 1 ? "es" : ""}
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        {item.is_vegetarian && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/90 text-white backdrop-blur-sm" title="Vegetarian">
                            <Leaf className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {item.is_spicy && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90 text-white backdrop-blur-sm" title="Spicy">
                            <Flame className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>

                      {item.is_popular && (
                        <div className="absolute left-3 top-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-sangeet-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-current" />
                            Popular
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-3 right-3">
                        <span className="rounded-lg bg-white/95 px-3 py-1 text-sm font-bold text-sangeet-900 shadow-sm backdrop-blur-sm">
                          HK${item.price}
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
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{item.preparation_time} min</span>
                        </div>
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="flex gap-1">
                            {item.allergens.map((a) => (
                              <span
                                key={a}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
