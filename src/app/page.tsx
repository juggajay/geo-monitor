import ApplicationForm from "./components/application-form";
import StickyCTA from "./components/sticky-cta";
import HeroCTA from "./components/hero-cta";
import MidpageCTA from "./components/midpage-cta";

/* ── Data ── */

const FEATURES = [
  {
    title: "Multi-engine monitoring",
    description:
      "Track client visibility across Google AI Overviews, ChatGPT, Perplexity, Gemini, and Copilot from a single dashboard.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
      />
    ),
  },
  {
    title: "Client-level reports",
    description:
      "White-label reports showing exactly how each client appears in AI answers — sentiment, accuracy, and citation tracking included.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    ),
  },
  {
    title: "Competitive intelligence",
    description:
      "See how clients rank against competitors in AI results. Spot gaps and opportunities before anyone else.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    ),
  },
  {
    title: "Real-time alerts",
    description:
      "Instant notifications when AI representation changes — new citations, dropped mentions, or sentiment shifts.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    ),
  },
  {
    title: "Query discovery",
    description:
      "Uncover the exact queries where AI engines mention or ignore your clients. Build GEO strategy on real data.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    ),
  },
  {
    title: "Agency workspace",
    description:
      "Manage every client from one account. Role-based access, bulk actions, and a team dashboard.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    ),
  },
];

const FAQS = [
  {
    q: "What exactly does GEO Monitor track?",
    a: "We track how your clients appear in AI-generated search results across Google AI Overviews, ChatGPT, Perplexity, Gemini, and Microsoft Copilot. We monitor mentions, citations, sentiment, accuracy, and competitive positioning — everything you need to report on and optimize.",
  },
  {
    q: "How is this different from traditional rank tracking?",
    a: "Rank trackers monitor blue links. GEO Monitor tracks AI-generated answers — a completely different surface. We show whether your client is cited, quoted, recommended, or invisible to AI engines, and how that changes week over week.",
  },
  {
    q: "What does the beta include?",
    a: "Full platform access for up to 25 clients. Multi-engine monitoring, white-label reports, competitive intelligence, alerts, and priority support. We'll also incorporate your feedback directly into the roadmap.",
  },
  {
    q: "Is there a cost for the beta?",
    a: "No. The beta is free. We're looking for agency partners who will actively use the product and give honest feedback. After beta, early participants get founding-member pricing.",
  },
  {
    q: "How long is the beta?",
    a: "90 days, starting March 2026. Beta participants get uninterrupted access and a seamless transition to the full product at launch.",
  },
  {
    q: "Can I white-label reports for clients?",
    a: "Yes. All reports can be exported with your agency branding. White-label support is a core feature, not an afterthought.",
  },
];

const IDEAL_FOR = [
  "SEO and digital marketing agencies managing 5+ clients",
  "Agency leads who need to report on AI search visibility",
  "Teams already building a GEO / AIO strategy",
  "Agencies whose clients ask \"how do we show up in ChatGPT?\"",
];

const NOT_FOR = [
  "Solo consultants or freelancers with 1–2 clients",
  "Agencies focused exclusively on paid media",
  "Teams not ready to add a new reporting workflow",
];

/* ── Page ── */

export default function Home() {
  return (
    <>
      <StickyCTA />

      {/* ━━━ NAV ━━━ */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 backdrop-blur-xl"
        style={{ background: "rgba(6, 6, 10, 0.7)" }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald">
              <span className="text-sm font-bold text-text-inverse">G</span>
            </div>
            <span className="font-heading text-base font-semibold tracking-tight text-text-primary">
              GEO Monitor
            </span>
          </div>
          <a href="#apply" className="btn-primary !px-5 !py-2.5 !text-sm !rounded-xl">
            Apply for Beta
          </a>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background layers */}
        <div className="dot-grid absolute inset-0" />
        <div className="hero-glow" />

        {/* Content */}
        <div className="relative mx-auto max-w-5xl px-6 pb-32 pt-40 text-center md:pb-40 md:pt-52">
          {/* Beta badge */}
          <div className="animate-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full border border-emerald/20 bg-emerald/5 px-5 py-2 text-sm font-medium text-emerald">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald" />
            Beta &mdash; Limited to 50 agencies
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up delay-1 font-heading text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
            Your clients are
            <br />
            <span className="gradient-text">invisible</span>{" "}
            <span className="text-text-secondary">in AI search.</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up delay-2 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary md:mt-10 md:text-xl">
            Google AI Overviews, ChatGPT, and Perplexity are answering your
            clients&apos; customers directly. GEO Monitor reveals exactly how
            your clients appear&thinsp;&mdash;&thinsp;so you can act before the
            traffic disappears.
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-3 mt-12 md:mt-14">
            <HeroCTA />
          </div>

          {/* Trust line */}
          <p className="animate-fade-up delay-4 mt-10 text-sm text-text-tertiary">
            Built for agencies managing 5&ndash;500+ clients across SEO, content
            &amp; digital PR
          </p>
        </div>
      </section>

      {/* ━━━ PROBLEM ━━━ */}
      <div className="section-divider" />
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-5xl px-6">
          {/* Section label */}
          <p className="mb-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            The Problem
          </p>

          <h2 className="mx-auto max-w-3xl text-center font-heading text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
            AI is eating organic search.
            <br />
            <span className="text-text-secondary">Agencies are flying blind.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-text-secondary">
            Over half of Google searches now end without a click. AI Overviews
            answer the query directly. ChatGPT and Perplexity are the new front
            page. Your clients&apos; traffic is shifting&thinsp;&mdash;&thinsp;and
            you have zero visibility into where.
          </p>

          {/* Stat cards */}
          <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-3">
            {[
              { stat: "51%", label: "of Google searches are now zero-click" },
              { stat: "400M+", label: "weekly active ChatGPT users" },
              { stat: "0", label: "tools built for agency-scale GEO monitoring" },
            ].map((item) => (
              <div key={item.label} className="card p-8 text-center md:p-10">
                <div className="font-heading text-5xl font-extrabold text-emerald md:text-6xl">
                  {item.stat}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ SOLUTION ━━━ */}
      <div className="section-divider" />
      <section id="solution" className="relative py-28 md:py-40">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            The Solution
          </p>

          <h2 className="mx-auto max-w-3xl text-center font-heading text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
            See how AI engines
            <br />
            <span className="text-text-secondary">represent your clients.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-center text-lg leading-relaxed text-text-secondary">
            GEO Monitor continuously queries AI search engines and tracks exactly
            how your clients appear&thinsp;&mdash;&thinsp;mentions, citations,
            sentiment, accuracy, and competitive positioning. One dashboard, every
            engine, all your clients.
          </p>

          {/* Feature grid */}
          <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card group p-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-bg-elevated transition-colors group-hover:border-emerald/30 group-hover:bg-emerald/5">
                  <svg
                    className="h-5 w-5 text-text-secondary transition-colors group-hover:text-emerald"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mb-2.5 font-heading text-lg font-semibold text-text-primary">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ MIDPAGE CTA ━━━ */}
      <div className="section-divider" />
      <MidpageCTA />

      {/* ━━━ WHAT AGENCIES GET ━━━ */}
      <div className="section-divider" />
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Beta Includes
          </p>

          <h2 className="mx-auto max-w-3xl text-center font-heading text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
            Everything you need to
            <br />
            <span className="text-text-secondary">own AI visibility.</span>
          </h2>

          <div className="mt-16 grid gap-5 md:mt-20 md:grid-cols-2">
            {[
              {
                title: "Full platform access",
                desc: "Monitor up to 25 clients across every supported AI engine. No feature gates during beta.",
              },
              {
                title: "White-label reports",
                desc: "Export branded reports showing AI search presence, sentiment, and competitive positioning for each client.",
              },
              {
                title: "Priority support & feedback loop",
                desc: "Direct Slack channel with our team. Feature requests and bugs get fast-tracked.",
              },
              {
                title: "Founding member pricing",
                desc: "Lock in the best pricing when we launch. Beta partners get a permanent discount, guaranteed.",
              },
            ].map((item) => (
              <div key={item.title} className="card flex gap-5 p-7">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10">
                  <svg
                    className="h-5 w-5 text-emerald"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ WHO IT'S FOR ━━━ */}
      <div className="section-divider" />
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Is This For You?
          </p>

          <h2 className="mx-auto max-w-2xl text-center font-heading text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
            Built for agencies.
            <br />
            <span className="text-text-secondary">Not everyone.</span>
          </h2>

          <div className="mt-16 grid gap-6 md:mt-20 md:grid-cols-2">
            {/* Ideal for */}
            <div className="card overflow-hidden" style={{ borderColor: "rgba(0, 230, 138, 0.15)" }}>
              <div className="h-px bg-gradient-to-r from-transparent via-emerald/40 to-transparent" />
              <div className="p-8">
                <h3 className="mb-7 font-heading text-lg font-semibold text-emerald">
                  Ideal for
                </h3>
                <ul className="space-y-5">
                  {IDEAL_FOR.map((item) => (
                    <li key={item} className="flex gap-3.5 text-sm leading-relaxed text-text-primary">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Not for */}
            <div className="card p-8">
              <h3 className="mb-7 font-heading text-lg font-semibold text-text-tertiary">
                Probably not for
              </h3>
              <ul className="space-y-5">
                {NOT_FOR.map((item) => (
                  <li key={item} className="flex gap-3.5 text-sm leading-relaxed text-text-secondary">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <div className="section-divider" />
      <section className="relative py-28 md:py-40">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            FAQ
          </p>

          <h2 className="text-center font-heading text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
            Common questions
          </h2>

          <div className="mt-16 space-y-0 md:mt-20">
            {FAQS.map((faq, i) => (
              <div key={faq.q}>
                {i > 0 && <div className="section-divider" />}
                <details className="group">
                  <summary className="flex items-center justify-between gap-4 py-7 text-left font-heading text-base font-medium text-text-primary transition-colors hover:text-emerald md:text-lg">
                    {faq.q}
                    <svg
                      className="h-5 w-5 shrink-0 text-text-tertiary transition-transform duration-300 group-open:rotate-45"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </summary>
                  <div className="faq-body">
                    <div>
                      <p className="pb-7 text-sm leading-relaxed text-text-secondary">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ APPLICATION FORM ━━━ */}
      <div className="section-divider" />
      <section id="apply" className="relative py-28 md:py-40">
        {/* Subtle glow */}
        <div
          className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 opacity-40"
          style={{
            background: "radial-gradient(ellipse, rgba(0, 230, 138, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="mb-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
            Apply Now
          </p>

          <h2 className="mx-auto max-w-2xl text-center font-heading text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
            Get early access to
            <br />
            <span className="gradient-text">GEO Monitor.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-center text-lg text-text-secondary">
            Spots are limited. We&apos;re accepting agencies who will actively use
            the product and help shape its direction.
          </p>

          <div className="mt-14 md:mt-16">
            <ApplicationForm />
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <div className="section-divider" />
      <footer className="py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald">
                <span className="text-sm font-bold text-text-inverse">G</span>
              </div>
              <span className="font-heading text-base font-semibold tracking-tight text-text-primary">
                GEO Monitor
              </span>
            </div>
            <p className="text-sm text-text-tertiary">
              &copy; {new Date().getFullYear()} GEO Monitor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
