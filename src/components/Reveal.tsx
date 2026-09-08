"use client";

import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";

// useLayoutEffect is a no-op on the server and Next.js warns about it in SSR.
// Fall back to useEffect server-side; on the client it runs synchronously
// before paint, which is what we need for the hide-before-seen trick.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Reveal({ children, className = "", stagger = false }: { children: React.ReactNode; className?: string; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  // Default visible — JS opts INTO hiding, never out.
  // Elements already in the viewport on load never get hidden at all.
  const [visible, setVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only hide + observe elements that start entirely below the fold.
    if (el.getBoundingClientRect().top >= window.innerHeight * 0.92) {
      setVisible(false);
      setShouldAnimate(true);
    }
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.08, rootMargin: "0px 0px 40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldAnimate]);

  const revealClass = shouldAnimate ? `sk-reveal ${visible ? "sk-reveal-in" : ""}` : "";

  if (!stagger) {
    return (
      <div ref={ref} className={`${revealClass} ${className}`}>
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
            className={`${shouldAnimate ? "sk-reveal" : ""} ${visible ? "sk-reveal-in" : ""}`}
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
