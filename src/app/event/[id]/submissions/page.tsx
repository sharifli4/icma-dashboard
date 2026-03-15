"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import type { HackathonSubmissionData } from "@/shared/hackathon/contracts";

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
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

interface HackathonSession {
  id: number;
  eventName: string;
  token: string;
  submitPath: string;
  startDate: string;
  endDate: string;
  submissionCount: number;
}

interface EventInfo {
  id: number;
  title: string;
  eventType: string;
}

export default function EventSubmissionsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [hackathonSession, setHackathonSession] = useState<HackathonSession | null>(null);
  const [submissions, setSubmissions] = useState<HackathonSubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    fetchEventAndSession();
  }, [session, status, params.id]);

  const fetchEventAndSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const eventRes = await fetch(`/api/events/${params.id}`);
      if (!eventRes.ok) {
        setError("Event not found");
        setLoading(false);
        return;
      }
      const eventJson = await eventRes.json();
      setEventInfo(eventJson.data);

      const sessionRes = await fetch(`/api/events/${params.id}/hackathon-session`);
      if (!sessionRes.ok) {
        const sessionJson = await sessionRes.json();
        setError(sessionJson.error || "Failed to load hackathon session");
        setLoading(false);
        return;
      }
      const sessionJson = await sessionRes.json();
      
      if (!sessionJson.data) {
        setError("No hackathon session found for this event");
        setLoading(false);
        return;
      }

      setHackathonSession(sessionJson.data);
      await fetchSubmissions(sessionJson.data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (token: string) => {
    setLoadingSubmissions(true);
    try {
      const response = await fetch(`/api/hackathon/sessions/${token}/submissions`);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to fetch submissions");
      setSubmissions(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isSessionActive = () => {
    if (!hackathonSession) return false;
    const now = new Date();
    return now >= new Date(hackathonSession.startDate) && now <= new Date(hackathonSession.endDate);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="border-2 border-red-500 bg-red-50 px-6 py-4 text-sm text-red-700 font-bold">
          {error}
        </div>
        <a 
          href={`/event/${params.id}`}
          className="border-2 border-[var(--border)] px-6 py-3 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon />
          Back to Event
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <a href="/" className="flex items-center gap-2">
            <img src="/icma_logo.svg" alt="ICMA.IO" className="w-7 h-7" />
            ICMA.IO
          </a>
        </div>
        <a 
          href={`/event/${params.id}`}
          className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon />
          Back to Event
        </a>
      </header>

      <main className="flex-1 bg-[#f5f5f5]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <CodeIcon />
              <span className="text-xs font-bold uppercase text-[var(--muted)]">Hackathon Submissions</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              {eventInfo?.title}
            </h1>
            {hackathonSession && (
              <div className="flex items-center gap-4 mt-3">
                <span
                  className={`text-xs font-bold px-3 py-1 border-2 ${
                    isSessionActive()
                      ? "border-green-500 text-green-700 bg-green-50"
                      : "border-gray-400 text-gray-600 bg-gray-50"
                  }`}
                >
                  {isSessionActive() ? "SUBMISSIONS OPEN" : "SUBMISSIONS CLOSED"}
                </span>
                <span className="text-sm text-[var(--muted)]">
                  Deadline: {formatDate(hackathonSession.endDate)}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border-2 border-[var(--border)] bg-white p-5">
              <div className="text-3xl font-black">{submissions.length}</div>
              <div className="text-xs font-bold uppercase text-[var(--muted)]">
                Total Submissions
              </div>
            </div>
            {hackathonSession && (
              <>
                <div className="border-2 border-[var(--border)] bg-white p-5">
                  <div className="text-sm font-mono font-bold">{formatDate(hackathonSession.startDate)}</div>
                  <div className="text-xs font-bold uppercase text-[var(--muted)]">
                    Submissions Opened
                  </div>
                </div>
                <div className="border-2 border-[var(--border)] bg-white p-5">
                  <div className="text-sm font-mono font-bold">{formatDate(hackathonSession.endDate)}</div>
                  <div className="text-xs font-bold uppercase text-[var(--muted)]">
                    Submission Deadline
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submissions List */}
          <div className="border-2 border-[var(--border)] bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[var(--border)]">
              <h2 className="text-lg font-bold uppercase">
                Submitted Projects
              </h2>
              {hackathonSession && (
                <button
                  onClick={() => fetchSubmissions(hackathonSession.token)}
                  disabled={loadingSubmissions}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border-2 border-[var(--border)] hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <RefreshIcon />
                  REFRESH
                </button>
              )}
            </div>

            <div className="p-5">
              {loadingSubmissions ? (
                <div className="text-sm text-[var(--muted)] text-center py-8">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--border)] p-8 text-center">
                  <p className="text-[var(--muted)]">No submissions yet</p>
                  <p className="text-xs text-[var(--muted)] mt-2">
                    Projects submitted by participants will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="border-2 border-[var(--border)] p-5 hover:shadow-[4px_4px_0px_var(--border)] transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-[var(--muted)]">#{index + 1}</span>
                            <h3 className="text-lg font-bold uppercase">{submission.projectName}</h3>
                          </div>
                          <p className="text-sm text-[var(--muted)] mt-1">
                            Team: <span className="font-bold text-[var(--foreground)]">{submission.team}</span>
                          </p>
                        </div>
                        <div className="text-xs text-[var(--muted)] text-right">
                          <div>Submitted</div>
                          <div className="font-bold">{formatDate(submission.createdAt)}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <a
                          href={submission.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[var(--border)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
                        >
                          <LinkIcon />
                          LIVE DEMO
                        </a>
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[var(--border)] hover:bg-gray-100 transition-colors"
                        >
                          <GithubIcon />
                          GITHUB
                        </a>
                        <a
                          href={submission.demoVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[var(--border)] hover:bg-gray-100 transition-colors"
                        >
                          <VideoIcon />
                          DEMO VIDEO
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
