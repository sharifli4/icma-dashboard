"use client";

import { useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";

interface HackathonSessionResult {
  id: number;
  eventName: string;
  token: string;
  submitPath: string;
  startDate: string;
  endDate: string;
  qrCodeSvg: string;
}

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

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
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
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [eventType, setEventType] = useState("Event");
  const [category, setCategory] = useState("AI / Machine Learning");
  const [location, setLocation] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [enableSubmissions, setEnableSubmissions] = useState(true);
  const [bannerUrl, setBannerUrl] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hackathonResult, setHackathonResult] = useState<HackathonSessionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHackathonType = eventType === "Hackathon";

  const uploadFile = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    setUploading(false);
    if (res.ok) setBannerUrl(json.data.publicUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handlePublish = async () => {
    if (!title.trim() || !dateTime || !eventType || !category) {
      setError("Please fill in all required fields");
      return;
    }
    if (isHackathonType && enableSubmissions && !submissionDeadline) {
      setError("Please set a submission deadline for the hackathon");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        bannerUrl: bannerUrl || null,
        dateTime,
        eventType,
        category,
        location: location.trim() || null,
        registrationUrl: registrationUrl.trim() || null,
        hackathonEnabled: enableSubmissions,
        submissionDeadline: submissionDeadline || null,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      const json = await res.json();
      if (json.hackathonSession) {
        setHackathonResult(json.hackathonSession);
      } else {
        router.push("/dashboard");
      }
    } else {
      const json = await res.json();
      setError(json.error || "Failed to create event");
    }
  };

  const getSubmitUrl = () => {
    if (!hackathonResult) return "";
    return `${window.location.origin}${hackathonResult.submitPath}`;
  };

  const copyToClipboard = async () => {
    const url = getSubmitUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    router.push("/dashboard");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-sm">
        Loading...
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

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
          <span className="text-sm font-bold hidden sm:inline">{session.user.name}</span>
          <div className="w-9 h-9 border-2 border-[var(--border)] rounded-full flex items-center justify-center">
            <UserIcon />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="border-2 border-[var(--border)] px-4 py-1.5 text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </header>

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

          {error && (
            <div className="border-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold mb-6">
              {error}
            </div>
          )}

          {/* Event Title */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                dragActive ? "border-[var(--accent)] bg-amber-50" : "border-gray-400 bg-white"
              }`}
            >
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner preview" className="max-h-48 object-contain" />
              ) : uploading ? (
                <span className="text-sm font-bold">Uploading...</span>
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
            <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileSelect} className="hidden" />
          </div>

          <hr className="border-t-2 border-dashed border-gray-300 mb-6" />

          {/* Date & Event Type */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Date and Time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Event Type</label>
              <div className="relative">
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono appearance-none pr-10"
                >
                  {EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Category & Registration Link */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Event Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono appearance-none pr-10"
                >
                  {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">External Registration Link</label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="Luma, Google Forms, Typeform link"
                className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Virtual"
              className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Event Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the agenda, speakers, and technical requirements..."
              rows={6}
              className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono resize-none"
            />
          </div>

          {/* Hackathon Toggle */}
          <div className="border-2 border-[var(--border)] bg-white px-5 py-4 mb-6 flex items-start gap-3">
            <input
              type="checkbox"
              checked={enableSubmissions}
              onChange={(e) => setEnableSubmissions(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[var(--accent)] border-2 border-[var(--border)]"
            />
            <div>
              <span className="text-sm font-bold block">Enable Hackathon Submissions</span>
              <span className="text-xs text-[var(--muted)]">Allow participants to submit code repositories directly via ICMA.</span>
            </div>
          </div>

          {/* Hackathon Submission Deadline - Shows when Hackathon type and submissions enabled */}
          {isHackathonType && enableSubmissions && (
            <div className="border-2 border-[var(--accent)] bg-amber-50 p-5 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CodeIcon />
                <h3 className="text-sm font-black uppercase">Hackathon Configuration</h3>
              </div>
              <p className="text-xs text-[var(--muted)] mb-4">
                A submission link and QR code will be generated after creating this event.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Project Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  value={submissionDeadline}
                  onChange={(e) => setSubmissionDeadline(e.target.value)}
                  min={dateTime}
                  className="w-full border-2 border-[var(--border)] px-4 py-3 text-sm bg-white outline-none focus:border-[var(--accent)] transition-colors font-mono"
                />
                <p className="text-xs text-[var(--muted)] mt-2">
                  Participants can submit projects from the event start until this deadline.
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handlePublish}
            disabled={submitting}
            className="w-full bg-[var(--accent)] border-2 border-[var(--border)] py-4 text-base font-black uppercase tracking-wide hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Event"}
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
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy_Policy</a>
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms_of_Service</a>
        </div>
      </footer>

      {/* Hackathon Success Modal */}
      {hackathonResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-2 border-[var(--border)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2">
                <CodeIcon />
                <h2 className="text-lg font-black uppercase">Hackathon Created</h2>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-5">
              <div className="border-2 border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700 font-bold mb-6">
                Event and hackathon session created successfully!
              </div>

              <div className="space-y-4 text-sm font-mono mb-6">
                <div className="flex justify-between items-start">
                  <span className="text-[var(--muted)]">Event:</span>
                  <span className="font-bold text-right max-w-[200px]">{hackathonResult.eventName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[var(--muted)]">Submissions Open:</span>
                  <span className="font-bold">{new Date(hackathonResult.startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[var(--muted)]">Deadline:</span>
                  <span className="font-bold">{new Date(hackathonResult.endDate).toLocaleString()}</span>
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
                  dangerouslySetInnerHTML={{ __html: hackathonResult.qrCodeSvg }}
                />
                <p className="text-xs text-[var(--muted)] text-center mt-3">
                  Participants can scan this QR code to submit their projects.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full mt-6 bg-[var(--accent)] border-2 border-[var(--border)] py-3 text-sm font-black uppercase tracking-wide hover:bg-[var(--accent-hover)] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
