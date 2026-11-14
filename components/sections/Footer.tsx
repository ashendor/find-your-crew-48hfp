export default function Footer() {
  return (
    <footer className="bg-paper border-t-2 border-ink py-12">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-headline text-2xl mb-4">48 HOUR FILM PROJECT</h3>
            <p className="text-ink/70 text-sm mb-2">Dubai Edition</p>
            <p className="font-label font-semibold text-lg">27–29 NOV 2026</p>
          </div>
          
          <div>
            <h4 className="font-label font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.48hourfilm.com/dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink/70 hover:text-rust transition-colors underline"
                >
                  Official Event Website
                </a>
              </li>
              <li>
                <a href="/coming-soon" className="text-ink/70 hover:text-rust transition-colors underline">
                  Rules & Guidelines
                </a>
              </li>
              <li>
                <a href="/coming-soon" className="text-ink/70 hover:text-rust transition-colors underline">
                  Past Winners
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-label font-semibold mb-3 text-sm uppercase tracking-wide">About</h4>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-16 h-8 border border-ink bg-ink/5 flex items-center justify-center text-xs text-ink/40">
                LOGO
              </div>
              <p className="text-sm text-ink/70">Powered by LikeMinds</p>
            </div>
            <p className="text-xs text-ink/60">
              Connecting filmmakers, one crew at a time.
            </p>
          </div>
        </div>
        
        <div className="border-t border-ink/20 pt-6 text-center text-sm text-ink/60">
          <p>&copy; 2026 48 Hour Film Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
