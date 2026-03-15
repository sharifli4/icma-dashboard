import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your ICMA.IO account to manage events and communities.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
