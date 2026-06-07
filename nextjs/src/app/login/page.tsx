import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { UtensilsCrossed } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
  description: "Staff login for Sangeet Restaurant management dashboard.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sangeet-950 via-sangeet-900 to-sangeet-800 p-4">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sangeet-500 to-sangeet-700 shadow-xl shadow-sangeet-500/30">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-sangeet-200/70">
            Sign in to manage your restaurant
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
