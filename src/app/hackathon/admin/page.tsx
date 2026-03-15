"use client";

import { useState } from "react";
import type { CreateHackathonSessionResult } from "@/shared/hackathon/contracts";

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function HackathonAdminPage() {
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateHackathonSessionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hackathon/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventName, startDate, endDate }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to create session");
      }

      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getSubmitUrl = () => {
    if (!result) return "";
    return `${window.location.origin}${result.submitPath}`;
  };

  const copyToClipboard = async () => {
    const url = getSubmitUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setResult(null);
    setEventName("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          ICMA.IO
        </div>
        <span className="text-xs font-bold text-[var(--muted)] uppercase">Hackathon_Admin</span>
      </header>

      <main className="flex-1 p-6 lg:p-8 max-w-2xl mx-auto w-full">
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-6">
          Create_Submission_Session
        </h1>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
                Event_Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="e.g. AI Hackathon 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon />
                    Start_Date
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon />
                    End_Date
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {error && (
              <div className="border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] border-2 border-[var(--border)] px-6 py-3 text-sm font-bold uppercase hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "CREATING..." : "CREATE_SESSION"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="border-2 border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700 font-mono">
              Session created successfully!
            </div>

            <div className="border-2 border-[var(--border)] p-6">
              <h2 className="text-lg font-bold uppercase mb-4">Session_Details</h2>
              
              <div className="space-y-3 text-sm font-mono mb-6">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Event_Name:</span>
                  <span className="font-bold">{result.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Token:</span>
                  <span className="font-bold truncate max-w-[200px]">{result.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Start:</span>
                  <span className="font-bold">{new Date(result.startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">End:</span>
                  <span className="font-bold">{new Date(result.endDate).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t-2 border-[var(--border)] pt-6">
                <h3 className="text-sm font-bold uppercase mb-3 text-[var(--muted)]">Submission_URL</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getSubmitUrl()}
                    className="flex-1 border-2 border-[var(--border)] px-3 py-2 text-sm font-mono bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="border-2 border-[var(--border)] px-4 py-2 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>
              </div>

              <div className="border-t-2 border-[var(--border)] pt-6 mt-6">
                <h3 className="text-sm font-bold uppercase mb-4 text-[var(--muted)]">QR_Code</h3>
                <div 
                  className="flex justify-center p-6 bg-white border-2 border-[var(--border)]"
                  dangerouslySetInnerHTML={{ __html: result.qrCodeSvg }}
                />
                <p className="text-xs text-[var(--muted)] text-center mt-3">
                  Participants can scan this QR code to submit their projects
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="w-full border-2 border-[var(--border)] px-6 py-3 text-sm font-bold uppercase hover:bg-gray-100 transition-colors"
            >
              CREATE_ANOTHER_SESSION
            </button>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
        ICMA.IO // Hackathon_Admin_Panel
      </footer>
    </div>
  );
}
