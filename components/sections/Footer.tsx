import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-ink border-t-2 border-rust overflow-hidden">
      {/* Film strip top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-rust flex items-center justify-around">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-paper/40" />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Event info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 border-2 border-rust bg-rust flex items-center justify-center">
                <span className="font-headline text-paper text-xs">48</span>
              </div>
              <div className="leading-none">
                <div className="font-headline text-paper text-sm">HOUR FILM</div>
                <div className="font-headline text-rust text-xs">PROJECT</div>
              </div>
            </div>
            <p className="text-paper/60 text-sm font-label mb-1">Dubai Edition</p>
            <p className="text-paper font-label font-semibold text-lg">27–29 NOV 2026</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-label font-semibold mb-4 text-xs uppercase tracking-widest text-paper/50">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://www.48hourfilm.com/dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper/70 hover:text-rust transition-colors text-sm font-body inline-block"
                >
                  Official Event →
                </a>
              </li>
              <li>
                <Link href="/coming-soon" className="text-paper/70 hover:text-rust transition-colors text-sm font-body inline-block">
                  Browse Filmmakers →
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-paper/70 hover:text-rust transition-colors text-sm font-body inline-block">
                  How It Works →
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-label font-semibold mb-4 text-xs uppercase tracking-widest text-paper/50">
              Community
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/coming-soon" className="text-paper/70 hover:text-rust transition-colors text-sm font-body inline-block">
                  Join Network →
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-paper/70 hover:text-rust transition-colors text-sm font-body inline-block">
                  Past Projects →
                </Link>
              </li>
              <li>
                <Link href="/coming-soon" className="text-paper/70 hover:text-rust transition-colors text-sm font-body inline-block">
                  Contact Us →
                </Link>
              </li>
            </ul>
          </div>

          {/* Powered by */}
          <div>
            <h4 className="font-label font-semibold mb-4 text-xs uppercase tracking-widest text-paper/50">
              Platform
            </h4>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-6 border border-paper/30 bg-paper/5 flex items-center justify-center">
                <span className="text-[8px] text-paper/40 font-label">LOGO</span>
              </div>
              <p className="text-sm text-paper/60 font-body">by LikeMinds</p>
            </div>
            <p className="text-xs text-paper/50 font-body leading-relaxed">
              Connecting independent filmmakers across Dubai
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-paper/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-paper/40 font-body">
            © 2026 48 Hour Film Project Dubai. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/coming-soon" className="text-xs text-paper/40 hover:text-paper/70 transition-colors font-body">
              Privacy
            </Link>
            <Link href="/coming-soon" className="text-xs text-paper/40 hover:text-paper/70 transition-colors font-body">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />
    </footer>
  );
}
