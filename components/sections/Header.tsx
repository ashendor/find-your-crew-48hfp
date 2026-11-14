export default function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-dubai-blue text-paper font-label font-semibold text-sm border-2 border-ink">
            DUBAI
          </div>
          <div className="hidden sm:block text-sm font-label text-ink/60">
            27–29 NOV 2026
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-32 h-8 border-2 border-ink bg-ink/5 flex items-center justify-center text-xs font-label text-ink/40">
            48HFP LOGO
          </div>
        </div>
      </div>
    </header>
  );
}
