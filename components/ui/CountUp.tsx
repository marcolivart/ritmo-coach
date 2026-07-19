import { useEffect, useRef, useState } from "react";

/** Anima un número hacia su nuevo valor con rAF y easing-out.
 *  Con prefers-reduced-motion salta directamente al valor final. */
export function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  const previousRef = useRef(target);

  useEffect(() => {
    const from = previousRef.current;
    previousRef.current = target;
    if (from === target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (target - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Garantía de estado final: en pestañas en segundo plano el navegador
    // congela requestAnimationFrame y la animación no terminaría nunca.
    const settle = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      setValue(target);
    }, durationMs + 100);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [target, durationMs]);

  return value;
}

interface CountUpProps {
  value: number;
  decimals?: number;
  suffix?: string;
}

export default function CountUp({ value, decimals = 0, suffix = "" }: CountUpProps) {
  const animated = useCountUp(value);
  const text = animated.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return <>{text}{suffix}</>;
}
