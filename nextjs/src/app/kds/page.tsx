"use client";

import { useState, useEffect } from "react";
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Maximize,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";

// Define the shape of our KDS order state
type KDSOrderItem = {
  name: string;
  qty: number;
  notes: string;
};

type KDSOrder = {
  id: string; // The order_number, e.g. "SG-1045"
  dbId: string; // The UUID
  table: string;
  status: string;
  createdAt: Date;
  timeElapsed: number; // minutes
  items: KDSOrderItem[];
};

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const supabase = createClient();

  const fetchActiveOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, order_number, status, created_at,
        restaurant_tables ( table_number ),
        order_items (
          quantity, special_requests,
          menu_items ( name )
        )
      `)
      .in("status", ["new", "preparing"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }

    const now = new Date();
    const formattedOrders: KDSOrder[] = (data || []).map((o: any) => {
      const createdAt = new Date(o.created_at);
      const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);

      const items: KDSOrderItem[] = (o.order_items || []).map((item: any) => ({
        name: item.menu_items?.name || "Unknown Item",
        qty: item.quantity,
        notes: item.special_requests || ""
      }));

      return {
        id: o.order_number,
        dbId: o.id,
        table: Array.isArray(o.restaurant_tables) ? o.restaurant_tables[0]?.table_number : o.restaurant_tables?.table_number || "N/A",
        status: o.status,
        createdAt,
        timeElapsed: diffInMinutes,
        items
      };
    });

    setOrders(formattedOrders);
  };

  // Initial fetch and Realtime subscription
  useEffect(() => {
    fetchActiveOrders();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Play sound if new order and sound enabled
          if (payload.eventType === "INSERT" && soundEnabled) {
            // Ideally play an HTML5 audio element here
            console.log("DING! New order arrived");
          }
          fetchActiveOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled]);

  // Update clock and elapsed times every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setOrders(prev => prev.map(order => ({
        ...order,
        timeElapsed: Math.floor((now.getTime() - order.createdAt.getTime()) / 60000)
      })));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const updateOrderStatus = async (dbId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders(prev => prev.map(order => 
      order.dbId === dbId ? { ...order, status: newStatus } : order
    ).filter(order => order.status !== "completed" && order.status !== "ready"));

    // DB update
    // @ts-ignore - Supabase type inference without generated types causes never type
    await supabase.from("orders").update({ status: newStatus }).eq("id", dbId);
  };

  const getTimeColor = (minutes: number) => {
    if (minutes >= 20) return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800";
    if (minutes >= 15) return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800";
  };

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sangeet-500 to-sangeet-700">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-foreground leading-tight">
              Kitchen Display
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Sangeet Restaurant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-foreground font-mono text-xl font-bold">
            <Clock className="h-5 w-5 text-sangeet-500" />
            {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <div className="flex items-center gap-2 border-l border-border pl-6">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                soundEnabled 
                  ? "border-sangeet-500 text-sangeet-600 bg-sangeet-50 dark:bg-sangeet-900/20 dark:text-sangeet-400" 
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
              title="Toggle Notifications Sound"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main KDS Grid */}
      <main className="flex-1 overflow-x-auto p-6">
        <div className="flex h-full gap-6 pb-4">
          {orders.map((order) => {
            const timeColorClass = getTimeColor(order.timeElapsed);
            
            return (
              <div 
                key={order.id}
                className={cn(
                  "flex h-full w-[350px] shrink-0 flex-col overflow-hidden rounded-2xl border-2 bg-card shadow-sm transition-all",
                  order.timeElapsed >= 20 ? "border-red-500/50 shadow-red-500/10" : "border-border"
                )}
              >
                {/* Order Header */}
                <div className={cn("flex items-center justify-between border-b p-4", timeColorClass)}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-background font-mono text-sm font-bold text-foreground shadow-sm">
                      {order.table}
                    </div>
                    <div>
                      <p className="font-bold">{order.id}</p>
                      <div className="flex items-center gap-1 text-sm font-medium opacity-90">
                        <Clock className="h-3.5 w-3.5" />
                        {order.timeElapsed} mins
                        {order.timeElapsed >= 20 && <AlertTriangle className="ml-1 h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-foreground">
                          {item.qty}x
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground leading-tight">
                            {item.name}
                          </p>
                          {item.notes && (
                            <p className="mt-1 text-sm font-medium text-sangeet-600 dark:text-sangeet-400 bg-sangeet-50 dark:bg-sangeet-900/20 px-2 py-1 rounded-md inline-block">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border p-4 bg-muted/10">
                  {order.status === "new" ? (
                    <button
                      onClick={() => updateOrderStatus(order.dbId, "preparing")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-[0.98]"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      Start Preparing
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateOrderStatus(order.dbId, "new")}
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-muted-foreground/20 text-muted-foreground transition-colors hover:bg-muted"
                        title="Revert to New"
                      >
                        <RotateCcw className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.dbId, "completed")}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-green-700 active:scale-[0.98]"
                      >
                        <CheckCircle2 className="h-6 w-6" />
                        Mark Ready
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {orders.length === 0 && (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
              <CheckCircle2 className="mb-4 h-16 w-16 opacity-20" />
              <p className="text-2xl font-semibold">Kitchen is clear</p>
              <p className="mt-2">Waiting for new orders...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
