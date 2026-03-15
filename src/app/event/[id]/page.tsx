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

function QrCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
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

interface HackathonSession {
  id: number;
  eventName: string;
  token: string;
  submitPath: string;
  startDate: string;
  endDate: string;
  qrCodeSvg: string;
  submissionCount: number;
}

export default function EventDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hackathonSession, setHackathonSession] = useState<HackathonSession | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOrganizer = session && event?.organizer === session.user?.name;

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
            .then((r) => r.ok ? r.json() : null)
            .then((v) => { if (v) setHasVoted(v.hasVoted); })
            .catch(() => {});
        }
        setLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    if (session && event?.hackathonEnabled) {
      fetch(`/api/events/${event.id}/hackathon-session`)
        .then((r) => r.ok ? r.json() : null)
        .then((json) => {
          if (json?.data) {
            setHackathonSession(json.data);
          }
        })
        .catch(() => {});
    }
  }, [session, event]);

  const getSubmitUrl = () => {
    if (!hackathonSession) return "";
    return `${window.location.origin}${hackathonSession.submitPath}`;
  };

  const copyToClipboard = async () => {
    const url = getSubmitUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = async () => {
    if (!event || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/events/${event.id}/vote`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      setEvent((prev) => prev ? { ...prev, upvotes: data.upvotes } : prev);
      setHasVoted(data.hasVoted);
    } catch {
      // Network error — silently ignore
    } finally {
      setVoting(false);
    }
  };

  const formattedDate = event
    ? new Date(event.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  function renderContent() {
    if (loading) {
      return (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="border-2 border-gray-200 mb-8 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-6">
                <div className="w-24 h-5 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="w-3/4 h-10 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="w-1/2 h-10 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
            <div className="mb-8">
              <div className="w-24 h-4 bg-gray-200 animate-pulse rounded mb-3" />
              <hr className="border-t-2 border-gray-200 mb-4" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-100 animate-pulse rounded" />
                <div className="w-full h-4 bg-gray-100 animate-pulse rounded" />
                <div className="w-5/6 h-4 bg-gray-100 animate-pulse rounded" />
                <div className="w-full h-4 bg-gray-100 animate-pulse rounded" />
                <div className="w-3/4 h-4 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="h-14 bg-gray-200 animate-pulse rounded border-2 border-gray-200" />
            <div className="h-14 bg-gray-100 animate-pulse rounded border-2 border-gray-200" />
            <div className="border-2 border-gray-200 p-5">
              <div className="w-20 h-3 bg-gray-200 animate-pulse rounded mb-4" />
              <hr className="border-t border-gray-100 mb-4" />
              <div className="flex flex-col gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 animate-pulse rounded" />
                    <div>
                      <div className="w-16 h-2 bg-gray-200 animate-pulse rounded mb-1" />
                      <div className="w-28 h-4 bg-gray-100 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-2 border-gray-200 p-5">
              <div className="w-24 h-2 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 animate-pulse rounded" />
                <div>
                  <div className="w-32 h-4 bg-gray-200 animate-pulse rounded mb-1" />
                  <div className="w-24 h-2 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (notFound || !event) {
      return (
        <div className="py-24 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-black uppercase mb-4">Event Not Found</h1>
          <a href="/" className="border-2 border-[var(--border)] px-6 py-3 text-sm font-bold hover:bg-gray-100 transition-colors">
            Back to Home
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1">
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

          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3">Overview</h2>
            <hr className="border-t-2 border-[var(--border)] mb-4" />
            <p className="text-sm leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
              {event.description || "No description provided."}
            </p>
          </div>

          {event.hackathonEnabled && (
            <div className="border-2 border-[var(--border)] bg-[#f5f5f5] p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CodeIcon />
                    <h3 className="text-base font-black uppercase">Hackathon Mode Active</h3>
                  </div>
                  <p className="text-xs font-bold uppercase text-[var(--muted)]">
                    {hackathonSession ? (
                      new Date() < new Date(hackathonSession.startDate) ? (
                        <>Opens: {new Date(hackathonSession.startDate).toLocaleString()}</>
                      ) : new Date() > new Date(hackathonSession.endDate) ? (
                        <>Submissions closed</>
                      ) : (
                        <>Deadline: {new Date(hackathonSession.endDate).toLocaleString()}</>
                      )
                    ) : (
                      <>No active submission session</>
                    )}
                  </p>
                </div>
{!isOrganizer && (
                  hackathonSession && new Date() >= new Date(hackathonSession.startDate) && new Date() <= new Date(hackathonSession.endDate) ? (
                    <a href={hackathonSession.submitPath} className="border-2 border-[var(--border)] bg-white px-6 py-3 text-sm font-black uppercase hover:bg-gray-100 transition-colors flex-shrink-0">
                      Submit Project
                    </a>
                  ) : (
                    <span className="border-2 border-[var(--border)] bg-white px-6 py-3 text-sm font-black uppercase text-[var(--muted)] cursor-not-allowed">
                      Submit Project
                    </span>
                  )
                )}
              </div>

              {isOrganizer && hackathonSession && (
                <div className="mt-6 pt-6 border-t-2 border-[var(--border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Organizer Controls</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black">{hackathonSession.submissionCount}</span>
                      <span className="text-xs font-bold uppercase text-[var(--muted)]">
                        {hackathonSession.submissionCount === 1 ? "Project" : "Projects"} Submitted
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {new Date() <= new Date(hackathonSession.endDate) && (
                      <button onClick={() => setShowQrModal(true)} className="border-2 border-[var(--border)] bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-gray-100 transition-colors flex items-center gap-2">
                        <QrCodeIcon />
                        View QR Code & Link
                      </button>
                    )}
                    <a href={`/event/${event.id}/submissions`} className="border-2 border-[var(--border)] bg-white px-4 py-2 text-xs font-bold uppercase hover:bg-gray-100 transition-colors">
                      View Submissions ({hackathonSession.submissionCount})
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-80 flex flex-col gap-4">
          {event.registrationUrl && (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="bg-[var(--accent)] border-2 border-[var(--border)] px-6 py-4 text-base font-black uppercase flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)] transition-colors">
              Register Now
              <ArrowUpRightIcon />
            </a>
          )}

          <button onClick={handleVote} disabled={voting} className={`border-2 px-6 py-4 flex items-center justify-center gap-2 transition-colors cursor-pointer ${hasVoted ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}>
            <ThumbsUpIcon />
            <span className="text-sm font-bold">{event.upvotes} {hasVoted ? "Upvoted" : "Upvote"}</span>
          </button>

          <div className="border-2 border-[var(--border)] p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4">Event Info</h3>
            <hr className="border-t border-gray-200 mb-4" />
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0"><CalendarIcon /></div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Date & Time</span>
                  <span className="text-sm font-bold">{formattedDate}</span>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0"><LocationIcon /></div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Location</span>
                    <span className="text-sm font-bold">{event.location}</span>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 border-2 border-[var(--border)] flex items-center justify-center flex-shrink-0"><CategoryIcon /></div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[var(--muted)]">Category</span>
                  <span className="text-sm font-bold">{event.category}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-[var(--border)] p-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Organized By</h3>
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
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar — always visible */}
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <img src="/icma_logo.svg" alt="ICMA.IO" className="w-7 h-7" />
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

      {/* Main — skeleton or content */}
      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
{renderContent()}
        </div>
      </main>

      {/* Footer — always visible */}
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

      {/* QR Code Modal */}
      {showQrModal && hackathonSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-2 border-[var(--border)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <QrCodeIcon />
                <h2 className="text-lg font-black uppercase">Hackathon Submission</h2>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1 hover:bg-gray-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-center gap-3 bg-[var(--accent)] border-2 border-[var(--border)] p-4 mb-6">
                <span className="text-3xl font-black">{hackathonSession.submissionCount}</span>
                <span className="text-sm font-bold uppercase">
                  {hackathonSession.submissionCount === 1 ? "Project" : "Projects"} Submitted
                </span>
              </div>

              <div className="space-y-4 text-sm font-mono mb-6">
                <div className="flex justify-between items-start">
                  <span className="text-[var(--muted)]">Event:</span>
                  <span className="font-bold text-right max-w-[200px]">{hackathonSession.eventName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[var(--muted)]">Submissions Open:</span>
                  <span className="font-bold">{new Date(hackathonSession.startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[var(--muted)]">Deadline:</span>
                  <span className="font-bold">{new Date(hackathonSession.endDate).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t-2 border-[var(--border)] pt-5">
                <h3 className="text-xs font-bold uppercase mb-3 text-[var(--muted)]">Submission URL</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getSubmitUrl()}
                    className="flex-1 border-2 border-[var(--border)] px-3 py-2 text-sm font-mono bg-gray-50 truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="border-2 border-[var(--border)] px-4 py-2 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)] mt-2">
                  Share this link with participants to submit their projects.
                </p>
              </div>

              <div className="border-t-2 border-[var(--border)] pt-5 mt-5">
                <h3 className="text-xs font-bold uppercase mb-4 text-[var(--muted)]">QR Code</h3>
                <div 
                  className="flex justify-center p-6 bg-white border-2 border-[var(--border)]"
                  dangerouslySetInnerHTML={{ __html: hackathonSession.qrCodeSvg }}
                />
                <p className="text-xs text-[var(--muted)] text-center mt-3">
                  Participants can scan this QR code to submit their projects.
                </p>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full mt-6 border-2 border-[var(--border)] py-3 text-sm font-black uppercase tracking-wide hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
