"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  User,
  MessageSquare,
  Loader2,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

import { createClient } from "@/lib/supabase/client";

export default function CartPage({
  params,
}: {
  params: Promise<{ tableNumber: string }>;
}) {
  // Unwrap the params - use React.use() for async params
  return <CartContent />;
}

function CartContent() {
  const {
    items,
    tableNumber,
    customerName,
    setCustomerName,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalItems,
  } = useCartStore();

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
  } | null>(null);

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      // Look up table UUID from table number
      const { data: tableData } = await supabase
        .from("restaurant_tables")
        .select("id")
        .eq("table_number", `T-${(tableNumber || "").padStart(2, '0')}`)
        .single();
        
      const tableId = (tableData as any)?.id;
      
      // Generate unique order number
      const orderNumber = `SG-${Date.now().toString(36).toUpperCase()}`;

      // Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          table_id: tableId,
          customer_name: customerName,
          special_instructions: specialInstructions,
          total_amount: totalAmount(),
          status: "new"
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert Order Items
      const orderItems = items.map(item => ({
        order_id: (orderData as any).id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        special_requests: item.specialRequests || ""
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems as any);

      if (itemsError) throw itemsError;

      setOrderSuccess({ orderNumber });
      clearCart();
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Order Placed!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your order{" "}
          <span className="font-mono font-semibold text-foreground">
            {orderSuccess.orderNumber}
          </span>{" "}
          has been sent to the kitchen.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Table {tableNumber} • We&apos;ll bring it to you shortly!
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href={`/qr/${tableNumber}`}
            className="rounded-xl bg-sangeet-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            Order More
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground/30" />
        <h2 className="mt-4 font-serif text-xl font-bold text-foreground">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add some delicious items from the menu!
        </p>
        <Link
          href={`/qr/${tableNumber}`}
          className="mt-6 rounded-xl bg-sangeet-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href={`/qr/${tableNumber}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-foreground">Your Order</h1>
            <p className="text-xs text-muted-foreground">
              Table {tableNumber} •{" "}
              {totalItems()} item{totalItems() !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.menuItem.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={item.menuItem.image_url || ""}
                  alt={item.menuItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {item.menuItem.name}
                </h3>
                <p className="text-xs font-bold text-sangeet-600 dark:text-sangeet-400">
                  HK${item.menuItem.price}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.menuItem.id, item.quantity - 1)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border transition-colors active:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.menuItem.id, item.quantity + 1)
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-sangeet-500 text-white transition-colors active:bg-sangeet-600"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => removeItem(item.menuItem.id)}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors active:bg-red-50 dark:active:bg-red-900/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Name */}
        <div className="mt-6">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Your Name
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          />
        </div>

        {/* Special Instructions */}
        <div className="mt-4">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Special Instructions (optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={2}
            placeholder="Any allergies or special requests?"
            className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          />
        </div>
      </div>

      {/* Order Summary Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur-lg">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">
            HK${totalAmount().toFixed(0)}
          </span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting || !customerName.trim()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold text-white shadow-lg transition-all",
            isSubmitting || !customerName.trim()
              ? "cursor-not-allowed bg-sangeet-400"
              : "bg-gradient-to-r from-sangeet-500 to-sangeet-600 shadow-sangeet-500/25 active:scale-[0.98]"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </button>
      </div>
    </div>
  );
}
