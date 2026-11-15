import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find Your Crew by LikeMinds | Dubai 2026",
  description: "Meet filmmakers, build your crew and collaborate on a short film in 48 hours. A LikeMinds creative initiative for the 48 Hour Film Project Dubai.",
  keywords: ["48 hour film project", "Dubai", "filmmaking", "film crew", "collaboration"],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

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
