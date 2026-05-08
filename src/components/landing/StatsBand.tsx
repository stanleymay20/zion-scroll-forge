const stats = [
  { value: "12", label: "Supreme Faculties" },
  { value: "100+", label: "Living Courses" },
  { value: "9", label: "Degree Tiers" },
  { value: "∞", label: "Kingdom Impact" },
];

export const StatsBand = () => {
  return (
    <section className="py-12 sm:py-16 px-4 bg-primary text-primary-foreground relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--accent)) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="container mx-auto max-w-5xl relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="animate-fade-up text-center"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl bg-gradient-to-b from-accent to-[hsl(42_70%_55%)] bg-clip-text text-transparent leading-none mb-2">
                {s.value}
              </div>
              <div className="text-[11px] sm:text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary-foreground/70">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
