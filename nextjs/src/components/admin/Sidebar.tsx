"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Utensils,
  CalendarDays,
  QrCode,
  Users,
  Settings,
  BarChart3,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ClipboardList },
  { name: "Menu", href: "/admin/menu", icon: Utensils },
  { name: "Reservations", href: "/admin/reservations", icon: CalendarDays },
  { name: "QR Codes", href: "/admin/qr", icon: QrCode },
  { name: "Staff", href: "/admin/staff", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-[4.5rem] shrink-0 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sangeet-500 to-sangeet-700 shadow-sm">
          <UtensilsCrossed className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-serif text-lg font-bold leading-tight">
            Sangeet
          </span>
          <span className="ml-1 text-xs font-medium uppercase text-muted-foreground">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sangeet-50 text-sangeet-700 dark:bg-sangeet-900/20 dark:text-sangeet-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-sangeet-600 dark:text-sangeet-400"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="shrink-0 border-t border-border p-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
