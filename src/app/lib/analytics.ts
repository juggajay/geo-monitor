import posthog from "posthog-js";

type AnalyticsEvent =
  | "hero_cta_click"
  | "midpage_cta_click"
  | "form_start"
  | "form_submit"
  | "qualified_submit"
  | "disqualified_submit"
  | "variant_assignment"
  | "page_view";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  console.log(`[GEO Monitor] ${event}`, properties);

  // PostHog SDK
  if (posthog.__loaded) {
    posthog.capture(event, properties);
  }

  // GA4
  if (window.gtag) {
    window.gtag("event", event, properties);
  }
}
