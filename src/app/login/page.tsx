"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center bg-white sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <img src="/icma_logo.svg" alt="ICMA.IO" className="w-7 h-7" />
          ICMA.IO
        </a>
      </header>

      <div className="h-1 bg-[var(--accent)]" />

      <main className="flex-1 bg-[#f5f5f5] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="inline-block bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              Authentication
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
              Login.
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Access your community dashboard and manage events.
            </p>
          </div>

          {error && (
            <div className="border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.io"
                required
                className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] border-2 border-[var(--border)] py-4 text-base font-black uppercase tracking-wide hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-[var(--muted)]">
            Don&apos;t have an account?{" "}
            <a href="/join" className="font-bold text-[var(--foreground)] underline">
              Register here
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border)] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] bg-white">
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          <span className="font-bold text-[var(--accent)]">ICMA.IO</span>
          <span>&copy;2024 ICMA_Network // System_Status: Online</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy_Policy</a>
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms_of_Service</a>
        </div>
      </footer>
    </div>
  );
}
