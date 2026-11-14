import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find Your Crew | 48 Hour Film Project Dubai",
  description: "Two days. Two nights. One film. Your team starts here. Join the 48 Hour Film Project Dubai, 27-29 November 2026.",
  keywords: ["48 hour film project", "Dubai", "filmmaking", "film crew", "collaboration"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
