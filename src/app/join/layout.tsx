import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Council",
  description: "Register your community on ICMA.IO. Create events, manage hackathons, and grow your network.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
