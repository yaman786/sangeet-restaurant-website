"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Flame,
  Leaf,
  Plus,
  Minus,
  ShoppingCart,
  UtensilsCrossed,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category_name: string;
  image_url: string;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_popular: boolean;
  allergens: string[] | null;
  preparation_time: number;
  is_active: boolean;
}

interface QRMenuClientProps {
  tableNumber: string;
  menuItems: MenuItem[];
  categories: string[];
}

export function QRMenuClient({
  tableNumber,
  menuItems,
  categories,
}: QRMenuClientProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { items, addItem, totalItems, setTableNumber } = useCartStore();

  useEffect(() => {
    setTableNumber(tableNumber);
  }, [tableNumber, setTableNumber]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category_name === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((i) => i.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sangeet-500 to-sangeet-700">
              <UtensilsCrossed className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Sangeet</p>
              <p className="text-[10px] text-muted-foreground">
                Table {tableNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all",
                activeCategory === cat
                  ? "bg-sangeet-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Items */}
      <div className="space-y-3 px-4 pt-4">
        {filteredItems.map((item) => {
          const qty = getItemQuantity(item.id);
          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              {/* Image */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                {item.is_popular && (
                  <div className="absolute left-1 top-1">
                    <Star className="h-3.5 w-3.5 fill-sangeet-400 text-sangeet-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <div className="ml-2 flex shrink-0 gap-1">
                      {item.is_vegetarian && (
                        <Leaf className="h-3.5 w-3.5 text-green-500" />
                      )}
                      {item.is_spicy && (
                        <Flame className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-sangeet-700 dark:text-sangeet-400">
                    HK${item.price}
                  </span>

                  {/* Add to Cart */}
                  {qty === 0 ? (
                    <button
                      onClick={() =>
                        addItem(
                          {
                            ...item,
                            created_at: "",
                            updated_at: "",
                          } as any,
                          1
                        )
                      }
                      className="flex items-center gap-1 rounded-lg bg-sangeet-500 px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const store = useCartStore.getState();
                          store.updateQuantity(item.id, qty - 1);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground transition-colors active:bg-muted"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold text-foreground">
                        {qty}
                      </span>
                      <button
                        onClick={() =>
                          addItem(
                            {
                              ...item,
                              created_at: "",
                              updated_at: "",
                            } as any,
                            1
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-sangeet-500 text-white transition-colors active:bg-sangeet-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Bar */}
      {totalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur-lg">
          <Link
            href={`/qr/${tableNumber}/cart`}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-sangeet-500 to-sangeet-600 px-5 py-3.5 text-white shadow-lg shadow-sangeet-500/25 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">
                {totalItems()} item{totalItems() !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-sm font-bold">View Cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
