"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";

interface EventItem {
  id: number;
  title: string;
  dateTime: string;
  status: string;
  upvotes: number;
}

function statusColor(status: string) {
  switch (status) {
    case "LIVE":
      return "bg-green-500 text-white";
    case "DRAFT":
      return "bg-yellow-500 text-white";
    case "ENDED":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-300";
  }
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
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

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

interface ProfileData {
  communityName: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  socialUrl: string | null;
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const eventsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(events.length / eventsPerPage));
  const paginatedEvents = events.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  // Profile state
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events?mine=true");
    const json = await res.json();
    if (json.data) setEvents(json.data);
    setEventsLoaded(true);
  }, []);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleDeleteEvent = async (id: number) => {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== id));
    setConfirmDeleteId(null);
  };

  const handleToggleStatus = async (id: number, current: string) => {
    const newStatus = current === "LIVE" ? "DRAFT" : "LIVE";
    const res = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    }
  };

  const loadProfile = useCallback(async () => {
    const res = await fetch("/api/community-profile");
    const json = await res.json();
    if (json.data) {
      setCommunityName(json.data.communityName || "");
      setDescription(json.data.description || "");
      setLogoUrl(json.data.logoUrl || "");
      setWebsiteUrl(json.data.websiteUrl || "");
      setSocialUrl(json.data.socialUrl || "");
    }
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    if (session) {
      loadProfile();
      loadEvents();
    }
  }, [session, loadProfile, loadEvents]);

  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const handleSave = async () => {
    if (!communityName.trim()) return;
    setSaving(true);
    setSaveMessage("");

    const res = await fetch("/api/community-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        communityName: communityName.trim(),
        description: description.trim(),
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl.trim() || null,
        socialUrl: socialUrl.trim() || null,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 2000);
    } else {
      const json = await res.json();
      setSaveMessage(json.error || "Failed to save");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-5 bg-gray-200 animate-pulse rounded" />
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-20 h-9 bg-gray-200 animate-pulse rounded" />
          </div>
        </header>
        <main className="flex-1 bg-[#f5f5f5]">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8">
              <div className="w-72 h-10 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="w-96 h-4 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-[380px] border-2 border-gray-200 bg-white p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="w-28 h-3 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="w-full h-10 bg-gray-100 animate-pulse rounded" />
                  </div>
                ))}
              </div>
              <div className="flex-1 border-2 border-gray-200 bg-white p-6">
                <div className="flex justify-between mb-6">
                  <div className="w-48 h-6 bg-gray-200 animate-pulse rounded" />
                  <div className="w-40 h-8 bg-gray-200 animate-pulse rounded" />
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100">
                    <div className="w-14 h-5 bg-gray-200 animate-pulse rounded" />
                    <div className="flex-1 h-4 bg-gray-200 animate-pulse rounded" />
                    <div className="w-24 h-4 bg-gray-100 animate-pulse rounded" />
                    <div className="w-8 h-4 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-2 border-[var(--border)] max-w-md w-full">
            <div className="border-b-2 border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                System Notification
              </span>
              <button
                onClick={() => setShowWelcome(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-6">
              <div className="w-12 h-12 bg-[var(--accent)] flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                Welcome to ICMA
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                Your community node has been successfully registered on the ICMA network.
                You now have access to create events, manage members, and connect with the
                global community.
              </p>
              <div className="border-2 border-gray-200 p-4 mb-5">
                <p className="text-xs font-bold uppercase tracking-wider mb-2">Quick Start</p>
                <ul className="text-sm text-[var(--muted)] space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold mt-0.5">01.</span>
                    Set up your community profile on the left panel
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold mt-0.5">02.</span>
                    Create your first event to engage your members
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--accent)] font-bold mt-0.5">03.</span>
                    Share your event page link to gather RSVPs
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-[var(--accent)] border-2 border-[var(--border)] py-3 text-sm font-black uppercase hover:bg-[var(--accent-hover)] transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <img src="/icma_logo.svg" alt="ICMA.IO" className="w-7 h-7" />
          ICMA.IO
        </a>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold hidden sm:inline">{communityName || session.user.name}</span>
          <div className="w-9 h-9 border-2 border-[var(--border)] rounded-full flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={communityName} className="w-full h-full object-cover" />
            ) : (
              <UserIcon />
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 bg-[#f5f5f5]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
              Community Dashboard
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Manage your digital workspace and upcoming sessions.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left - Community Profile */}
            <div className="lg:w-[380px] border-2 border-[var(--border)] bg-white p-6 self-start">
              <h2 className="text-lg font-bold uppercase mb-6 flex items-center gap-2">
                <GearIcon />
                Community Profile
              </h2>

              {!profileLoaded ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="w-28 h-3 bg-gray-200 animate-pulse rounded mb-2" />
                      <div className="w-full h-10 bg-gray-100 animate-pulse rounded" />
                    </div>
                  ))}
                  <div className="w-full h-28 bg-gray-100 animate-pulse rounded border-2 border-dashed border-gray-200" />
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-gray-100 animate-pulse rounded" />
                    <div className="flex-1 h-10 bg-gray-100 animate-pulse rounded" />
                  </div>
                  <div className="w-full h-12 bg-gray-200 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Community Name
                    </label>
                    <input
                      type="text"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      placeholder="e.g. ICMA Innovators"
                      className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Short Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your community..."
                      rows={4}
                      className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono resize-none"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                      Community Logo
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-400 h-28 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors overflow-hidden"
                    >
                      {uploading ? (
                        <span className="text-xs font-bold text-[var(--muted)]">Uploading...</span>
                      ) : logoUrl ? (
                        <img src={logoUrl} alt="Community logo" className="max-h-24 object-contain" />
                      ) : (
                        <>
                          <ImageIcon />
                          <span className="text-xs font-bold mt-1 text-[var(--muted)]">UPLOAD FILE</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.svg,.jpg,.jpeg,.webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-3 mb-5">
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                        Website Link
                      </label>
                      <div className="flex items-center border-2 border-[var(--border)] px-3 py-3 gap-2">
                        <LinkIcon />
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://your-website.com"
                          className="bg-transparent outline-none text-xs font-mono w-full"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                        Social Link
                      </label>
                      <div className="flex items-center border-2 border-[var(--border)] px-3 py-3 gap-2">
                        <GlobeIcon />
                        <input
                          type="text"
                          value={socialUrl}
                          onChange={(e) => setSocialUrl(e.target.value)}
                          placeholder="@username or URL"
                          className="bg-transparent outline-none text-xs font-mono w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || !communityName.trim()}
                    className="w-full bg-[var(--accent)] border-2 border-[var(--border)] py-3 text-sm font-black uppercase hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  {saveMessage && (
                    <div className={`mt-3 text-xs font-bold text-center ${saveMessage === "Saved!" ? "text-green-600" : "text-red-600"}`}>
                      {saveMessage}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right - Event Management */}
            <div className="flex-1 border-2 border-[var(--border)] bg-white p-6 self-start">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold uppercase flex items-center gap-2">
                  <CalendarIcon />
                  Event Management
                </h2>
                <a href="/dashboard/create-event" className="bg-[var(--border)] text-white px-4 py-2 text-xs font-bold flex items-center gap-1 hover:bg-black transition-colors">
                  + CREATE NEW EVENT
                </a>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[80px_1fr_120px_60px_80px] items-center text-xs font-bold uppercase tracking-wider text-[var(--muted)] border-b-2 border-[var(--border)] pb-3 mb-1">
                <span>Status</span>
                <span>Event Title</span>
                <span>Date</span>
                <span>RSVPs</span>
                <span />
              </div>

              {/* Table Rows */}
              {!eventsLoaded ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-[80px_1fr_120px_60px_80px] items-center py-4 border-b border-gray-100">
                      <div className="w-12 h-5 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-8" />
                      <div className="h-4 w-4 bg-gray-100 animate-pulse rounded" />
                    </div>
                  ))}
                </>
              ) : paginatedEvents.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--muted)]">No events yet. Create your first event!</div>
              ) : (
                paginatedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="grid grid-cols-[80px_1fr_120px_60px_80px] items-center py-4 border-b border-gray-200 last:border-b-0"
                  >
                    <span>
                      <button
                        onClick={() => handleToggleStatus(event.id, event.status)}
                        className={`text-[10px] font-bold px-2 py-0.5 cursor-pointer ${statusColor(event.status)}`}
                        title="Click to toggle status"
                      >
                        {event.status}
                      </button>
                    </span>
                    <a href={`/event/${event.id}`} className="text-sm font-bold hover:underline">{event.title}</a>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(event.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-sm font-black">{event.upvotes}</span>
                    {confirmDeleteId === event.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-[10px] font-bold text-red-600 hover:bg-red-100 px-1.5 py-0.5 transition-colors"
                        >
                          YES
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] font-bold text-[var(--muted)] hover:bg-gray-100 px-1.5 py-0.5 transition-colors"
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(event.id)}
                        className="flex items-center justify-center hover:bg-red-100 rounded p-1 transition-colors text-[var(--muted)] hover:text-red-600"
                        title="Delete event"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                ))
              )}

              {/* Pagination */}
              <div className="border-t-2 border-[var(--border)] mt-4 pt-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-2 border-[var(--border)] px-4 py-2 text-xs font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  PREVIOUS
                </button>
                <span className="text-xs font-bold uppercase">
                  Page {String(currentPage).padStart(2, "0")} of {String(totalPages).padStart(2, "0")}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-2 border-[var(--border)] px-4 py-2 text-xs font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  NEXT
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
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
