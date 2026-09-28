"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleToggle, setRoleToggle] = useState<"AM" | "MT">("AM");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction({}, formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Inloggen mislukt");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-soft p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-lg border border-line p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-charcoal mb-2 font-serif">
            KPI Dashboard
          </h1>
          <p className="text-text-muted text-sm mb-8">De Vlasschuur</p>

          {/* Role toggle (cosmetic only) */}
          <div className="flex gap-2 mb-8 bg-bg-soft rounded-lg p-1">
            <button
              type="button"
              onClick={() => setRoleToggle("AM")}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                roleToggle === "AM"
                  ? "bg-brand-orange text-white"
                  : "text-charcoal hover:bg-white"
              }`}
            >
              Accountmanager
            </button>
            <button
              type="button"
              onClick={() => setRoleToggle("MT")}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                roleToggle === "MT"
                  ? "bg-brand-orange text-white"
                  : "text-charcoal hover:bg-white"
              }`}
            >
              Management
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ronald.vandervelde@devlasschuur.nl"
                required
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:border-brand-orange"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-status-red rounded text-status-red text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-brand-orange text-white py-2 rounded-lg font-medium hover:bg-brand-orange-dark transition"
            >
              Inloggen
            </button>
          </form>

          <p className="text-xs text-text-muted mt-6 text-center">
            Demo: ronald.vandervelde@devlasschuur.nl / mt@devlasschuur.nl<br />
            Wachtwoord: demo123
          </p>
        </div>
      </div>
    </div>
  );
}
