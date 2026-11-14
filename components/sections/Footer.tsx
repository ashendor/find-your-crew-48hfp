import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-ink border-t-4 border-ink overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Desktop Footer */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between pb-6 border-b border-paper/20">
            {/* Left - LikeMinds branding */}
            <div className="flex items-center gap-3">
              <div className="font-heading text-paper text-2xl tracking-tight">
                LIKEMINDS
              </div>
              <div className="h-6 w-px bg-paper/30" />
              <p className="text-paper/60 text-sm font-editorial max-w-md">
                The creative community behind 48 Hour Dubai.
              </p>
            </div>

            {/* Right - Quick links */}
            <div className="flex items-center gap-6">
              <a
                href="https://www.48hourfilm.com/dubai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-paper/70 hover:text-paper transition-colors text-sm font-label"
              >
                Official Website
              </a>
              <Link href="/coming-soon" className="text-paper/70 hover:text-paper transition-colors text-sm font-label">
                Rules & Guidelines
              </Link>
              <Link href="/coming-soon" className="text-paper/70 hover:text-paper transition-colors text-sm font-label">
                Past Winners
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-center pt-6">
            <p className="text-xs text-paper/40 font-editorial">
              © 2026 48 Hour Film Project. All rights reserved.
            </p>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="sm:hidden pb-20">
          <div className="text-center mb-6">
            <div className="font-heading text-paper text-xl tracking-tight mb-2">
              LIKEMINDS
            </div>
            <p className="text-paper/60 text-xs font-editorial">
              The creative community behind 48 Hour Dubai.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 mb-6 border-t border-paper/20 pt-6">
            <a
              href="https://www.48hourfilm.com/dubai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper/70 hover:text-paper transition-colors text-sm font-label"
            >
              Official Website
            </a>
            <Link href="/coming-soon" className="text-paper/70 hover:text-paper transition-colors text-sm font-label">
              Rules & Guidelines
            </Link>
            <Link href="/coming-soon" className="text-paper/70 hover:text-paper transition-colors text-sm font-label">
              Past Winners
            </Link>
          </div>

          <div className="text-center border-t border-paper/20 pt-6">
            <p className="text-xs text-paper/40 font-editorial">
              © 2026 48 Hour Film Project
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
