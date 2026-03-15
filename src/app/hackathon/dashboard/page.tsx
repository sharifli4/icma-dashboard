"use client";

import { useEffect, useState } from "react";
import type { HackathonSessionData, HackathonSubmissionData } from "@/shared/hackathon/contracts";

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

export default function HackathonDashboardPage() {
  const [sessions, setSessions] = useState<HackathonSessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<HackathonSessionData | null>(null);
  const [submissions, setSubmissions] = useState<HackathonSubmissionData[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError(null);
    try {
      const response = await fetch("/api/hackathon/sessions");
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to fetch sessions");
      setSessions(json.data);
      if (json.data.length > 0 && !selectedSession) {
        setSelectedSession(json.data[0]);
        fetchSubmissions(json.data[0].token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoadingSessions(false);
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

  const handleSessionSelect = (session: HackathonSessionData) => {
    setSelectedSession(session);
    fetchSubmissions(session.token);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isSessionActive = (session: HackathonSessionData) => {
    const now = new Date();
    return now >= new Date(session.startDate) && now <= new Date(session.endDate);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <a href="/" className="flex items-center gap-2">
            <img src="/icma_logo.svg" alt="ICMA.IO" className="w-7 h-7" />
            ICMA.IO
          </a>
        </div>
        <span className="text-xs font-bold text-[var(--muted)] uppercase">Submissions_Dashboard</span>
      </header>

      <div className="flex flex-1">
        <aside className="w-72 border-r-2 border-[var(--border)] p-5 flex-shrink-0 sticky top-[57px] self-start h-[calc(100vh-57px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Sessions
            </h2>
            <button
              onClick={fetchSessions}
              className="p-1.5 border-2 border-[var(--border)] hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshIcon />
            </button>
          </div>

          {loadingSessions ? (
            <div className="text-sm text-[var(--muted)]">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-sm text-[var(--muted)]">No sessions found</div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session)}
                  className={`w-full text-left p-3 border-2 transition-colors ${
                    selectedSession?.id === session.id
                      ? "bg-[var(--accent)] border-[var(--border)]"
                      : "border-[var(--border)] hover:bg-gray-50"
                  }`}
                >
                  <div className="font-bold text-sm uppercase truncate">{session.eventName}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">
                    {new Date(session.startDate).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 border ${
                        isSessionActive(session)
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-gray-400 text-gray-600 bg-gray-50"
                      }`}
                    >
                      {isSessionActive(session) ? "ACTIVE" : "CLOSED"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <a
            href="/hackathon/admin"
            className="mt-6 flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-bold border-2 border-[var(--border)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            + NEW_SESSION
          </a>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          {error && (
            <div className="border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 font-mono mb-6">
              {error}
            </div>
          )}

          {selectedSession ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-tight">
                  {selectedSession.eventName}
                </h1>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {formatDate(selectedSession.startDate)} — {formatDate(selectedSession.endDate)}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold uppercase">
                  Submissions ({submissions.length})
                </h2>
                <button
                  onClick={() => fetchSubmissions(selectedSession.token)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold border-2 border-[var(--border)] hover:bg-gray-100 transition-colors"
                >
                  <RefreshIcon />
                  REFRESH
                </button>
              </div>

              {loadingSubmissions ? (
                <div className="text-sm text-[var(--muted)]">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--border)] p-8 text-center">
                  <p className="text-[var(--muted)]">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border-2 border-[var(--border)] p-5 hover:shadow-[4px_4px_0px_var(--border)] transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold uppercase">{submission.projectName}</h3>
                          <p className="text-sm text-[var(--muted)] mt-1">
                            Team: <span className="font-bold text-[var(--foreground)]">{submission.team}</span>
                          </p>
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {formatDate(submission.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <a
                          href={submission.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                        >
                          <LinkIcon />
                          DEMO
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
                          VIDEO
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--muted)]">Select a session to view submissions</p>
            </div>
          )}
        </main>
      </div>

      <footer className="border-t-2 border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
        ICMA.IO // Submissions_Dashboard
      </footer>
    </div>
  );
}
