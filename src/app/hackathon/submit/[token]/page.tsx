"use client";

import { useEffect, useState, use } from "react";
import type { HackathonSessionStatus, HackathonSubmissionData } from "@/shared/hackathon/contracts";

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

type PageProps = {
  params: Promise<{ token: string }>;
};

export default function HackathonSubmitPage({ params }: PageProps) {
  const { token } = use(params);

  const [status, setStatus] = useState<HackathonSessionStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [projectName, setProjectName] = useState("");
  const [team, setTeam] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoVideo, setDemoVideo] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<HackathonSubmissionData | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch(`/api/hackathon/sessions/${token}/status`);
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || "Failed to fetch session");
        }
        setStatus(json.data);
      } catch (err) {
        setStatusError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoadingStatus(false);
      }
    }
    fetchStatus();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoVideo) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append("projectName", projectName);
      formData.append("team", team);
      formData.append("demoUrl", demoUrl);
      formData.append("githubUrl", githubUrl);
      formData.append("demoVideo", demoVideo);

      const response = await fetch(`/api/hackathon/sessions/${token}/submissions`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || "Failed to submit project");
      }

      setSubmitResult(json.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono text-[var(--muted)]">Loading session...</p>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-bold uppercase mb-2">Session_Not_Found</h1>
          <p className="text-sm text-[var(--muted)]">{statusError}</p>
        </div>
      </div>
    );
  }

  if (!status) return null;

  if (!status.isActive) {
    const now = new Date();
    const start = new Date(status.startDate);
    const end = new Date(status.endDate);
    const notStarted = now < start;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <ClockIcon />
          </div>
          <h1 className="text-xl font-bold uppercase mb-2">
            {notStarted ? "Submissions_Not_Open" : "Submissions_Closed"}
          </h1>
          <p className="text-sm text-[var(--muted)] mb-4">
            {notStarted 
              ? `Submissions open on ${formatDate(status.startDate)}`
              : `Submissions closed on ${formatDate(status.endDate)}`
            }
          </p>
          <div className="border-2 border-[var(--border)] p-4 text-left">
            <div className="text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Event:</span>
                <span className="font-bold">{status.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Window:</span>
                <span>{formatDate(status.startDate)} - {formatDate(status.endDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b-2 border-[var(--border)] px-6 py-3">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            ICMA.IO
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-green-600 mb-4 flex justify-center">
              <CheckCircleIcon />
            </div>
            <h1 className="text-2xl font-bold uppercase mb-2">Submission_Received</h1>
            <p className="text-sm text-[var(--muted)] mb-6">
              Your project has been successfully submitted!
            </p>
            
            <div className="border-2 border-[var(--border)] p-5 text-left">
              <div className="space-y-3 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Project:</span>
                  <span className="font-bold">{submitResult.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Team:</span>
                  <span className="font-bold">{submitResult.team}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Submitted:</span>
                  <span>{formatDate(submitResult.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t-2 border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
          ICMA.IO // Hackathon_Submission
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-[var(--border)] px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <img src="/icma_logo.svg" alt="ICMA.IO" className="w-7 h-7" />
          ICMA.IO
        </div>
        <span className="text-xs font-bold text-[var(--muted)] uppercase">{status.eventName}</span>
      </header>

      <main className="flex-1 p-6 lg:p-8 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">
            Submit_Your_Project
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Submissions close on {formatDate(status.endDate)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
              Project_Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Enter your project name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
              Team_Name
            </label>
            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
              className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Enter your team name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
              Demo_URL
            </label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              required
              className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="https://your-demo.example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
              GitHub_URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              required
              className="w-full border-2 border-[var(--border)] px-4 py-2.5 text-sm font-mono bg-transparent outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="https://github.com/your-org/your-repo"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[var(--muted)]">
              Demo_Video
            </label>
            <div className="border-2 border-dashed border-[var(--border)] p-6 text-center">
              {demoVideo ? (
                <div className="space-y-2">
                  <p className="text-sm font-mono font-bold">{demoVideo.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {(demoVideo.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setDemoVideo(null)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => setDemoVideo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2 text-[var(--muted)]">
                    <UploadIcon />
                    <span className="text-sm font-bold">Click to upload video</span>
                    <span className="text-xs">MP4, WebM, or QuickTime (max 100MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {submitError && (
            <div className="border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 font-mono">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !demoVideo}
            className="w-full bg-[var(--accent)] border-2 border-[var(--border)] px-6 py-3 text-sm font-bold uppercase hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "SUBMITTING..." : "SUBMIT_PROJECT"}
          </button>
        </form>
      </main>

      <footer className="border-t-2 border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
        ICMA.IO // Hackathon_Submission
      </footer>
    </div>
  );
}
