"use client";

import { useState } from "react";

export default function LoginGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ar-auth") === "true";
    }
    return false;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        sessionStorage.setItem("ar-auth", "true");
        setAuthenticated(true);
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ar-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-ar-gold mb-3">
            Private Intelligence
          </p>
          <h1
            className="text-4xl text-cream tracking-wide"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Asset Radar
          </h1>
          <div className="w-12 h-px bg-ar-green mx-auto mt-4" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-ar-black-card border border-ar-black-border rounded px-4 py-3 text-cream text-sm placeholder:text-text-dim focus:outline-none focus:border-ar-green transition-colors"
              autoComplete="username"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-ar-black-card border border-ar-black-border rounded px-4 py-3 text-cream text-sm placeholder:text-text-dim focus:outline-none focus:border-ar-green transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-ar-red-light text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ar-green hover:bg-ar-green-light text-cream py-3 rounded text-sm tracking-wide uppercase transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
