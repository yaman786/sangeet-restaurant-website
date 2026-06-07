"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";

const timeSlots = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "17:00", "17:30", "18:00", "18:30", "19:00",
  "19:30", "20:00", "20:30", "21:00",
];

export function ReservationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    specialRequests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      // We don't have table_id here easily without querying, but we can set it to null 
      // or the backend admin can assign the table later. We will leave it null for now.
      
      // Combine date and time into a single ISO string for reservation_time
      const reservationTimeStr = `${formData.date}T${formData.time}:00`;
      const reservationTime = new Date(reservationTimeStr).toISOString();

      const { error } = await supabase.from("reservations").insert({
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        guests: formData.guests,
        special_requests: formData.specialRequests,
        reservation_time: reservationTime,
        status: "pending"
      } as any);

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to submit reservation:", error);
      alert("Failed to submit reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Reservation Submitted!
        </h2>
        <p className="mt-2 text-muted-foreground">
          We&apos;ve received your booking request for{" "}
          <span className="font-semibold text-foreground">
            {formData.guests} guest{formData.guests !== 1 ? "s" : ""}
          </span>{" "}
          on{" "}
          <span className="font-semibold text-foreground">{formData.date}</span>{" "}
          at{" "}
          <span className="font-semibold text-foreground">{formData.time}</span>.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          A confirmation email will be sent to{" "}
          <span className="font-medium">{formData.email}</span>.
        </p>
        <button
          onClick={() => {
            setIsSuccess(false);
            setFormData({
              name: "",
              email: "",
              phone: "",
              date: "",
              time: "",
              guests: 2,
              specialRequests: "",
            });
          }}
          className="mt-6 rounded-lg bg-sangeet-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
        >
          Make Another Reservation
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-serif text-xl font-bold text-foreground">
        Booking Details
      </h2>

      {/* Name & Email */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="John Doe"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="john@example.com"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          placeholder="+852 XXXX XXXX"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Time
          </label>
          <select
            required
            value={formData.time}
            onChange={(e) =>
              setFormData({ ...formData, time: e.target.value })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
          >
            <option value="">Select a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guests */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          Number of Guests
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                guests: Math.max(1, formData.guests - 1),
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-input text-foreground transition-colors hover:bg-muted"
          >
            −
          </button>
          <span className="w-12 text-center text-lg font-semibold text-foreground">
            {formData.guests}
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                guests: Math.min(20, formData.guests + 1),
              })
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-input text-foreground transition-colors hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
          Special Requests
        </label>
        <textarea
          value={formData.specialRequests}
          onChange={(e) =>
            setFormData({ ...formData, specialRequests: e.target.value })
          }
          rows={3}
          placeholder="Any dietary requirements or special occasions?"
          className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sangeet-500 focus:outline-none focus:ring-2 focus:ring-sangeet-500/20"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-semibold text-white shadow-lg transition-all",
          isSubmitting
            ? "cursor-not-allowed bg-sangeet-400"
            : "bg-gradient-to-r from-sangeet-500 to-sangeet-600 shadow-sangeet-500/25 hover:shadow-xl hover:brightness-110"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CalendarDays className="h-5 w-5" />
            Confirm Reservation
          </>
        )}
      </button>
    </form>
  );
}
