"use client";

export function AuditHero() {
  return (
    <div className="relative text-center pt-20 pb-10">
      <div className="hero-glow" />
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-secondary)] mb-6 animate-fade-up">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-emerald)] pulse-dot inline-block" />
        Live across ChatGPT · Claude · Perplexity
      </div>
      <h1
        className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[var(--color-text-primary)] mb-5 animate-fade-up delay-1"
      >
        How visible is your brand<br />
        <span className="gradient-text">to AI?</span>
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto animate-fade-up delay-2">
        Get your AI Visibility Score in 90 seconds — see exactly where you rank
        across the platforms your buyers are using right now.
      </p>
    </div>
  );
}
