"use client";

import { useEffect, useState } from "react";
import { track } from "../lib/analytics";

export default function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border backdrop-blur-2xl transition-all duration-300 md:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      }`}
      style={{ background: "rgba(6, 6, 10, 0.85)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <div>
          <p className="text-sm font-semibold text-text-primary font-heading">
            Limited beta spots
          </p>
          <p className="text-xs text-text-tertiary">Free for qualifying agencies</p>
        </div>
        <a
          href="#apply"
          onClick={() => track("midpage_cta_click", { source: "sticky_bar" })}
          className="btn-primary !rounded-xl !px-6 !py-3 !text-sm"
        >
          Apply
        </a>
      </div>
    </div>
  );
}
