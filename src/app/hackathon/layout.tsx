import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hackathon",
  description: "Manage hackathon sessions, submit projects, and view submissions on ICMA.IO.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
