import type { Metadata } from "next";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Sangeet Restaurant Management Dashboard",
};

import { createClient } from "@/lib/supabase/server";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all orders to calculate revenue and avg
  const { data: allOrders } = await supabase
    .from("orders")
    .select("total_amount");
    
  const totalOrders = allOrders?.length || 0;
  const totalRevenue = allOrders?.reduce((sum, order: any) => sum + Number(order.total_amount), 0) || 0;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Fetch total guests from reservations today
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  
  const { data: reservationsToday } = await supabase
    .from("reservations")
    .select("guests")
    .gte("reservation_time", startOfDay.toISOString());
    
  const totalGuests = reservationsToday?.reduce((sum, res: any) => sum + res.guests, 0) || 0;

  // Fetch recent orders
  const { data: recentOrdersData } = await supabase
    .from("orders")
    .select(`
      id, order_number, total_amount, status, created_at,
      restaurant_tables ( table_number )
    `)
    .order("created_at", { ascending: false })
    .limit(4);

  const stats = [
    {
      title: "Total Revenue",
      value: `HK$${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Expected Guests (Today)",
      value: totalGuests.toString(),
      change: "-2.4%",
      trend: "down",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Avg Order Value",
      value: `HK$${avgOrderValue.toFixed(0)}`,
      change: "+4.1%",
      trend: "up",
      icon: TrendingUp,
      color: "text-sangeet-600 dark:text-sangeet-400",
      bg: "bg-sangeet-100 dark:bg-sangeet-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back. Here's what's happening at Sangeet today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="font-serif text-lg font-bold text-foreground">Recent Orders</h2>
            <button className="text-sm font-semibold text-sangeet-600 hover:text-sangeet-700 dark:text-sangeet-400">
              View All
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrdersData?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-background font-mono text-xs font-bold text-foreground shadow-sm">
                      {Array.isArray(order.restaurant_tables) ? order.restaurant_tables[0]?.table_number : (order.restaurant_tables as any)?.table_number || "N/A"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(order.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-semibold text-foreground">HK${order.total_amount}</span>
                    <span className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                      order.status === "completed" 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {(!recentOrdersData || recentOrdersData.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-4">No recent orders found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Popular Items Placeholder */}
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h2 className="font-serif text-lg font-bold text-foreground">Popular Items Today</h2>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {[
                { name: "Butter Chicken", sales: 24 },
                { name: "Garlic Naan", sales: 42 },
                { name: "Momo (Steamed)", sales: 18 },
                { name: "Lamb Biryani", sales: 12 },
              ].map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{item.sales} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
