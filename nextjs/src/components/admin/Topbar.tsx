import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-[4.5rem] items-center justify-between border-b border-border bg-card px-8">
      {/* Search */}
      <div className="flex w-full max-w-md items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, menu items..."
            className="w-full rounded-xl border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-sangeet-500 ring-2 ring-card" />
        </button>

        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground">Admin User</span>
            <span className="text-xs text-muted-foreground">Manager</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sangeet-100 text-sangeet-700 dark:bg-sangeet-900/40 dark:text-sangeet-400">
            <span className="font-bold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}
