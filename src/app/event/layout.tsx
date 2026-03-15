import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Details",
  description: "View event details, register, and submit projects on ICMA.IO.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
