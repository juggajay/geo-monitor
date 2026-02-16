type AnalyticsEvent =
  | "hero_cta_click"
  | "midpage_cta_click"
  | "form_start"
  | "form_submit"
  | "qualified_submit"
  | "disqualified_submit";

declare global {
  interface Window {
    posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  console.log(`[GEO Monitor] ${event}`, properties);

  if (window.posthog) {
    window.posthog.capture(event, properties);
  }

  if (window.gtag) {
    window.gtag("event", event, properties);
  }
}
