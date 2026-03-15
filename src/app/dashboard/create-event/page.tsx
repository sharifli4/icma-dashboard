"use client";

import { useState, useRef } from "react";

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const EVENT_TYPES = ["Event", "Hackathon", "Workshop", "Networking"];
const CATEGORIES = [
  "AI / Machine Learning",
  "Cybersecurity",
  "Web3 / Blockchain",
  "Startups",
  "Product",
  "Data Science",
  "Other",
];

export default function CreateEventPage() {
  const [enableSubmissions, setEnableSubmissions] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) setBannerFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBannerFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          ICMA.IO
        </a>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold hidden sm:inline">ADMIN USER</span>
          <div className="w-9 h-9 border-2 border-[var(--border)] rounded-full flex items-center justify-center">
            <UserIcon />
          </div>
          <button className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors">
            LOGOUT
          </button>
        </div>
      </header>

      {/* Accent line */}
      <div className="h-1 bg-[var(--accent)]" />

      {/* Main */}
      <main className="flex-1 bg-[#f5f5f5]">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
            Create New Event
          </h1>
          <p className="text-sm text-[var(--muted)] mb-10 flex items-center gap-0">
            <span className="w-1 h-5 bg-[var(--accent)] mr-3 inline-block" />
            Deploy a new technical activation to the ICMA community.
          </p>

          {/* Event Title */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Event Title
            </label>
            <input
              type="text"
              placeholder="e.g. NeurIPS 2024 After-Party"
              className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
            />
          </div>

          {/* Event Image */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Event Image
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed h-52 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-[var(--accent)] bg-amber-50"
                  : "border-gray-400 bg-white"
              }`}
            >
              {bannerFile ? (
                <span className="text-sm font-bold text-center px-4 break-all">
                  {bannerFile.name}
                </span>
              ) : (
                <>
                  <UploadIcon />
                  <span className="text-sm font-bold mt-3">Click to upload banner</span>
                  <span className="text-xs text-[var(--muted)] mt-1">
                    PNG, JPG or WebP (1200x630px recommended)
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="mt-4 border-2 border-[var(--border)] px-5 py-2 text-xs font-bold hover:bg-gray-100 transition-colors bg-white"
                  >
                    SELECT FILE
                  </button>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <hr className="border-t-2 border-dashed border-gray-300 mb-6" />

          {/* Date & Event Type */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Date and Time
              </label>
              <input
                type="datetime-local"
                className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Event Type
              </label>
              <div className="relative">
                <select className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono appearance-none pr-10">
                  {EVENT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category & Registration Link */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                Event Category
              </label>
              <div className="relative">
                <select className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono appearance-none pr-10">
                  {CATEGORIES.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                External Registration Link
              </label>
              <input
                type="url"
                placeholder="Luma, Google Forms, Typeform link"
                className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Event Description
            </label>
            <textarea
              placeholder="Outline the agenda, speakers, and technical requirements..."
              rows={6}
              className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono resize-none"
            />
          </div>

          {/* Hackathon Submissions Toggle */}
          <div className="border-2 border-[var(--border)] bg-white px-5 py-4 mb-8 flex items-start gap-3">
            <input
              type="checkbox"
              checked={enableSubmissions}
              onChange={(e) => setEnableSubmissions(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[var(--accent)] border-2 border-[var(--border)]"
            />
            <div>
              <span className="text-sm font-bold block">Enable Hackathon Submissions</span>
              <span className="text-xs text-[var(--muted)]">
                Allow participants to submit code repositories directly via ICMA.
              </span>
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-[var(--accent)] border-2 border-[var(--border)] py-4 text-base font-black uppercase tracking-wide hover:bg-[var(--accent-hover)] transition-colors">
            Publish Event
          </button>
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
