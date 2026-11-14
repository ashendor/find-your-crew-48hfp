export default function FilmstripDivider() {
  return (
    <div className="w-full h-8 flex items-center justify-center gap-2 my-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-6 border-2 border-ink bg-paper"
        />
      ))}
    </div>
  );
}
