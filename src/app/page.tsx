"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const CATEGORIES = ["AI", "Cybersecurity", "Startups", "Product", "Web3", "Data"];
const TIMELINE_OPTIONS = ["Today", "This Week", "This Month", "Custom Date"];

interface EventData {
  id: number;
  title: string;
  description: string;
  bannerUrl: string | null;
  dateTime: string;
  eventType: string;
  category: string;
  location: string | null;
  upvotes: number;
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 22V11l5-9 1.5 1L12 8h8a2 2 0 0 1 2 2.3l-1.5 8A2 2 0 0 1 18.5 20H7Z" />
      <path d="M2 11h3v11H2z" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [activeTimeline, setActiveTimeline] = useState("Today");
  const [activeType, setActiveType] = useState("Event");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setEvents(json.data);
        setLoaded(true);
      });
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const featured = events[0] || null;
  const upcoming = events.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
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

        <div className="hidden sm:flex items-center border-2 border-[var(--border)] rounded px-3 py-1.5 gap-2 w-72">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search_Events..."
            className="bg-transparent outline-none text-sm font-mono w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <a href="/dashboard" className="text-sm font-bold hover:underline">
                {session.user.name}
              </a>
              <button
                onClick={() => signOut()}
                className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors">
                LOGIN
              </a>
              <a href="/join" className="bg-[var(--accent)] border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
                JOIN_NOW
              </a>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r-2 border-[var(--border)] p-5 flex-shrink-0 sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto">
          {/* Timeline Filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--muted)]">
              Timeline_Filter
            </h3>
            <div className="flex flex-col gap-1.5">
              {TIMELINE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setActiveTimeline(option)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-left border-2 transition-colors ${
                    activeTimeline === option
                      ? "bg-[var(--accent)] border-[var(--border)]"
                      : "border-transparent hover:border-[var(--border)]"
                  }`}
                >
                  <CalendarIcon />
                  {option.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selector */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--muted)]">
              Type_Selector
            </h3>
            <div className="flex border-2 border-[var(--border)]">
              {["Event", "Hackathon"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex-1 px-3 py-2 text-sm font-bold transition-colors ${
                    activeType === type
                      ? "bg-[var(--accent)]"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--muted)]">
              Categories_Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold border-2 transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-[var(--accent)] border-[var(--border)]"
                      : "border-[var(--border)] hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Filters */}
          <button className="w-full bg-[var(--border)] text-white py-2.5 text-sm font-bold hover:bg-black transition-colors">
            APPLY_FILTERS
          </button>

          {/* Admin Section */}
          <div className="mt-6 pt-6 border-t-2 border-[var(--border)]">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--muted)]">
              Admin_Tools
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href="/hackathon/admin"
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold border-2 border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                CREATE_HACKATHON
              </a>
              <a
                href="/hackathon/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold border-2 border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                VIEW_SUBMISSIONS
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {!loaded ? (
            <div className="py-16 text-center text-sm font-bold text-[var(--muted)]">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-3">No Events Yet</h2>
              <p className="text-sm text-[var(--muted)] mb-6">Be the first to create an event on ICMA.IO</p>
              <a href="/join" className="bg-[var(--accent)] border-2 border-[var(--border)] px-6 py-3 text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
                GET STARTED
              </a>
            </div>
          ) : (
            <>
              {/* Trending Today */}
              {featured && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold uppercase tracking-tight">
                      Trending_Today
                    </h2>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 border-2 border-[var(--border)] flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ArrowIcon direction="left" />
                      </button>
                      <button className="w-8 h-8 border-2 border-[var(--border)] flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ArrowIcon direction="right" />
                      </button>
                    </div>
                  </div>

                  {/* Featured Card */}
                  <div className="border-2 border-[var(--border)] flex flex-col md:flex-row overflow-hidden">
                    <div className="md:w-1/2 bg-[#0a1628] flex items-center justify-center p-10 min-h-[280px] overflow-hidden">
                      {featured.bannerUrl ? (
                        <img src={featured.bannerUrl} alt={featured.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-48 h-48 rounded-full border border-[#2a4a6b] opacity-60 flex items-center justify-center">
                          <div className="w-36 h-36 rounded-full border border-[#2a4a6b] opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-2 mb-3">
                          <span className="px-2 py-0.5 text-xs font-bold border-2 border-[var(--border)] bg-gray-100">
                            {featured.eventType.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-bold border-2 border-[var(--border)] bg-gray-100">
                            {featured.category.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold uppercase mb-3 leading-tight">
                          {featured.title}
                        </h3>
                        <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">
                          {featured.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--muted)] mb-4">
                          <span className="flex items-center gap-1">
                            <CalendarIcon />
                            {new Date(featured.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {featured.location && (
                            <span className="flex items-center gap-1">
                              <LocationIcon />
                              {featured.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="border-t-2 border-[var(--border)] pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <ThumbsUpIcon />
                          {featured.upvotes}
                        </div>
                        <a href={`/event/${featured.id}`} className="bg-[var(--accent)] border-2 border-[var(--border)] px-5 py-2 text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
                          VIEW_DETAILS
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {upcoming.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight mb-5">
                    Upcoming_Events
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {upcoming.map((event) => (
                      <div
                        key={event.id}
                        className="border-2 border-[var(--border)] flex flex-col overflow-hidden hover:shadow-[4px_4px_0px_var(--border)] transition-shadow"
                      >
                        <div className="relative bg-gray-200 h-44 overflow-hidden">
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-2 py-0.5 text-xs font-bold border-2 border-[var(--border)] bg-[var(--accent)]">
                              {event.eventType.toUpperCase()}
                            </span>
                          </div>
                          {event.bannerUrl ? (
                            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-base font-bold uppercase mb-1.5">
                            {event.title}
                          </h3>
                          <p className="text-xs text-[var(--muted)] leading-relaxed mb-3 flex-1 line-clamp-2">
                            {event.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[var(--muted)] mb-3">
                            <span className="flex items-center gap-1">
                              <CalendarIcon />
                              {new Date(event.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <LocationIcon />
                                {event.location}
                              </span>
                            )}
                          </div>
                          <div className="border-t-2 border-[var(--border)] pt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <ThumbsUpIcon />
                              {event.upvotes}
                            </div>
                            <a href={`/event/${event.id}`} className="border-2 border-[var(--border)] px-3 py-1.5 text-xs font-bold hover:bg-gray-100 transition-colors">
                              VIEW_DETAILS
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--border)] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)]">
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
