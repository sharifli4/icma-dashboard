import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Dashboard",
  description: "Manage your community profile, events, and hackathon sessions on ICMA.IO.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
