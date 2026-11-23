"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * 3D-рамка: карточка наклоняется за курсором (перспектива + пружина), по ней скользит блик.
 * Только для мыши — на телефоне и при «уменьшить движение» остаётся обычной карточкой.
 * `className` — внешней обёртке (размер, место в сетке), `radius` — скругление блика.
 */
export function Tilt({
  children,
  className = "",
  max = 8,
  lift = 1.02,
  radius = "1rem",
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  radius?: string;
}) {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFine(q.matches);
    const on = () => setFine(q.matches);
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), spring);
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), spring);
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.3), rgba(255,255,255,0) 50%)`;
  const [hover, setHover] = useState(false);

  if (reduce || !fine) return <div className={className}>{children}</div>;

  return (
    <div className={`tilt-3d ${className}`} style={{ perspective: 1000 }}>
      <motion.div
        className="relative h-full"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        animate={{ scale: hover ? lift : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => {
          setHover(false);
          mx.set(0.5);
          my.set(0.5);
        }}
      >
        {children}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light transition-opacity duration-300"
          style={{ background: glare, borderRadius: radius, opacity: hover ? 1 : 0 }}
        />
      </motion.div>
    </div>
  );
}
