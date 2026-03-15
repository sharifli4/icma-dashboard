"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

function ThumbsUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 22V11l5-9 1.5 1L12 8h8a2 2 0 0 1 2 2.3l-1.5 8A2 2 0 0 1 18.5 20H7Z" />
      <path d="M2 11h3v11H2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

interface EventDetail {
  id: number;
  title: string;
  description: string;
  bannerUrl: string | null;
  dateTime: string;
  eventType: string;
  category: string;
  location: string | null;
  registrationUrl: string | null;
  hackathonEnabled: boolean;
  upvotes: number;
  status: string;
  organizer: string;
}

export default function EventDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((json) => {
        if (json?.data) {
          setEvent(json.data);
          fetch(`/api/events/${json.data.id}/vote`)
            .then((r) => r.json())
            .then((v) => setHasVoted(v.hasVoted));
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleVote = async () => {
    if (!event || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/vote`, { method: "POST" });
      const data = await res.json();
      setEvent((prev) => prev ? { ...prev, upvotes: data.upvotes } : prev);
      setHasVoted(data.hasVoted);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-sm">
        Loading...
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black uppercase mb-4">Event Not Found</h1>
        <a href="/" className="border-2 border-[var(--border)] px-6 py-3 text-sm font-bold hover:bg-gray-100 transition-colors">
          Back to Home
        </a>
      </div>
    );
  }

  const formattedDate = new Date(event.dateTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded border-2 border-[var(--border)] flex items-center justify-center bg-[var(--accent)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          ICMA.IO
        </a>
        <div className="flex items-center gap-3">
          {session ? (
            <a href="/dashboard" className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors">
              DASHBOARD
            </a>
          ) : (
            <>
              <a href="/login" className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors">
                LOGIN
              </a>
              <a href="/join" className="bg-[var(--accent)] border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
                JOIN NOW
              </a>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1">
              {/* Hero Banner */}
              <div className="border-2 border-[var(--border)] mb-8 overflow-hidden">
                <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400">
                  {event.bannerUrl ? (
                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs uppercase tracking-widest opacity-50">
                      Event Banner
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="inline-block border-2 border-[var(--border)] px-2 py-0.5 text-[10px] font-bold uppercase mb-3 bg-gray-100">
                    {event.eventType}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                    {event.title}
                  </h1>
                </div>
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Overview</h2>
                <hr className="border-t-2 border-[var(--border)] mb-4" />
                <p className="text-sm leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
                  {event.description || "No description provided."}
                </p>
              </div>

              {/* Hackathon Banner */}
              {event.hackathonEnabled && (
                <div className="border-2 border-[var(--border)] bg-[#f5f5f5] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CodeIcon />
                      <h3 className="text-base font-black uppercase">Hackathon Mode Active</h3>
                    </div>
                    <p className="text-xs font-bold uppercase text-[var(--muted)]">
                      Submissions are open
                    </p>
                  </div>
                  <a
                    href="#"
                    className="border-2 border-[var(--border)] bg-white px-6 py-3 text-sm font-black uppercase hover:bg-gray-100 transition-colors flex-shrink-0"
                  >
                    Submit Project
                  </a>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:w-80 flex flex-col gap-4">
              {/* Register Button */}
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[var(--accent)] border-2 border-[var(--border)] px-6 py-4 text-base font-black uppercase flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Register Now
                  <ArrowUpRightIcon />
                </a>
              )}

              {/* Upvotes */}
              <button
                onClick={handleVote}
                disabled={voting}
                className={`border-2 px-6 py-4 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  hasVoted
                    ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
                    : "border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                <ThumbsUpIcon />
                <span className="text-sm font-bold">{event.upvotes} {hasVoted ? "Upvoted" : "Upvote"}</span>
              </button>

              {/* Event Info */}
              <div className="border-2 border-[var(--border)] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Event Info</h3>
                <hr className="border-t border-gray-200 mb-4" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0">
                      <CalendarIcon />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Date & Time</span>
                      <span className="text-sm font-bold">{formattedDate}</span>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0">
                        <LocationIcon />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Location</span>
                        <span className="text-sm font-bold">{event.location}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0">
                      <CategoryIcon />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Category</span>
                      <span className="text-sm font-bold">{event.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organized By */}
              <div className="border-2 border-[var(--border)] p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
                  Organized By
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-[var(--border)] flex items-center justify-center font-black text-sm bg-gray-100">
                    {event.organizer.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-sm font-bold">{event.organizer}</span>
                    <span className="text-[10px] text-[var(--muted)]">Verified Organizer</span>
                  </div>
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
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy_Policy</a>
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms_of_Service</a>
        </div>
      </footer>
    </div>
  );
}
