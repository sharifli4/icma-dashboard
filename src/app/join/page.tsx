"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

export default function JoinPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const uploadFile = async (file: File) => {
    setLogoFile(file);
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    setUploading(false);
    if (res.ok) {
      setLogoUrl(json.data.publicUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/svg+xml")) {
      if (file.size <= 2 * 1024 * 1024) uploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleSubmit = async () => {
    if (!agreed || !name || !email || !password) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Registered but login failed. Please login manually.");
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

      {/* Main Content */}
      <main className="flex-1 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* Hero */}
          <div className="mb-8">
            <span className="inline-block bg-[var(--accent)] px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4">
              Registration Portal
            </span>
            <h1 className="text-5xl md:text-6xl font-black uppercase leading-[1.05] tracking-tight mb-4">
              Join The<br />Council.
            </h1>
            <p className="text-base text-[var(--muted)] max-w-lg leading-relaxed">
              Community Admin Registration. Establish your node in the global
              ICMA network and manage your members with absolute precision.
            </p>
          </div>

          <hr className="border-t-2 border-[var(--border)] mb-10" />

          {error && (
            <div className="border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold mb-6 max-w-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Form */}
            <div className="flex-1">
              {/* Section 01 */}
              <div className="mb-10">
                <h2 className="text-base font-bold uppercase mb-5 flex items-center gap-0">
                  <span className="w-1 h-5 bg-[var(--accent)] mr-3" />
                  01. Community Profile
                </h2>

                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Neo Tokyo Research Hub"
                    className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                    Short Description (Max 200 Chars)
                  </label>
                  <textarea
                    placeholder="A high-frequency trading and research guild..."
                    maxLength={200}
                    rows={4}
                    className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Website Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Social Links (Twitter/X)
                    </label>
                    <input
                      type="text"
                      placeholder="@handle"
                      className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 02 */}
              <div className="mb-8">
                <h2 className="text-base font-bold uppercase mb-5 flex items-center gap-0">
                  <span className="w-1 h-5 bg-[var(--accent)] mr-3" />
                  02. Admin Credentials
                </h2>

                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full legal or alias name"
                    className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@domain.io"
                      className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 border-2 border-[var(--border)] accent-[var(--accent)]"
                />
                <span className="text-sm">
                  I agree to the ICMA{" "}
                  <a href="#" className="underline font-bold">Terms of Service</a>{" "}
                  and{" "}
                  <a href="#" className="underline font-bold">Protocol Guidelines</a>.
                </span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!agreed || !name || !email || !password || loading}
                className="w-full max-w-lg bg-[var(--accent)] border-2 border-[var(--border)] py-4 text-base font-black uppercase tracking-wide hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register Community"}
              </button>

              <p className="mt-4 text-sm text-[var(--muted)]">
                Already have an account?{" "}
                <a href="/login" className="font-bold text-[var(--foreground)] underline">
                  Login here
                </a>
              </p>
            </div>

            {/* Right Column */}
            <div className="lg:w-80 flex flex-col gap-6">
              {/* Logo Upload */}
              <div className="border-2 border-[var(--border)] bg-white p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-center mb-4">
                  Community Logo
                </h3>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed mx-auto w-48 h-36 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4 ${
                    dragActive
                      ? "border-[var(--accent)] bg-amber-50"
                      : "border-gray-400"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="max-h-28 object-contain" />
                  ) : uploading ? (
                    <span className="text-xs font-bold">Uploading...</span>
                  ) : logoFile ? (
                    <span className="text-xs font-bold text-center px-2 break-all">
                      {logoFile.name}
                    </span>
                  ) : (
                    <>
                      <UploadIcon />
                      <span className="text-xs font-bold mt-2">DRAG & DROP</span>
                      <span className="text-[10px] text-[var(--muted)]">
                        PNG, SVG (MAX 2MB)
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.svg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex justify-center mb-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-[var(--border)] px-4 py-1.5 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    SELECT FILE
                  </button>
                </div>
                <p className="text-[10px] text-[var(--muted)] text-center leading-relaxed">
                  This will be visible on the global<br />
                  network explorer. Use 1:1 aspect<br />
                  ratio.
                </p>
              </div>

              {/* Protocol Note */}
              <div className="bg-[var(--border)] text-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <InfoIcon />
                  <span className="text-xs font-bold uppercase text-[var(--accent)]">
                    Protocol Note
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-5 text-gray-300">
                  Upon successful registration, your community will enter a 24-hour
                  verification phase. Ensure all technical documentation links are
                  valid to avoid delays.
                </p>
                <div className="border-t border-gray-600 pt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase text-gray-500">Status</span>
                  <span className="text-[10px] uppercase text-gray-400">Ready for Uplink</span>
                </div>
                <div className="mt-1.5 w-full h-0.5 bg-gray-700">
                  <div className="h-full w-1/3 bg-[var(--accent)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border)] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] bg-white">
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          <span className="font-bold text-[var(--accent)]">ICMA.IO</span>
          <span>&copy;2024 ICMA_Network // System_Status: Online</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">
            Privacy_Policy
          </a>
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">
            Terms_of_Service
          </a>
        </div>
      </footer>
    </div>
  );
}
