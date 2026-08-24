"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper. `stagger` cascades direct children in on a small
 * per-index delay (same technique as SignalPulse's marketing site) instead
 * of the whole block fading in as one flat unit — groups of 4 repeat the
 * offset so a long grid doesn't end up with one child waiting a full second.
 */
export function Reveal({ children, className = "", stagger = false }: { children: React.ReactNode; className?: string; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!stagger) {
    return (
      <div ref={ref} className={`sk-reveal ${visible ? "sk-reveal-in" : ""} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {Children.toArray(children).map((child, i) =>
        isValidElement(child) ? (
          <div
            key={i}
            className={`sk-reveal ${visible ? "sk-reveal-in" : ""}`}
            style={{ transitionDelay: visible ? `${(i % 4) * 70}ms` : "0ms" }}
          >
            {child}
          </div>
        ) : (
          child
        ),
      )}
    </div>
  );
}
