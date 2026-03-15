import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Event",
  description: "Deploy a new event or hackathon to the ICMA.IO community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
